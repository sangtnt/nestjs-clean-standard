import {
  CreateUserRequestDto,
  CreateUserResponseDto,
} from '@/application/user/dtos/create-user.dto';
import { CreateUserUseCase } from '@/application/user/usecases/create-users.usecase';
import { Inject, Injectable } from '@nestjs/common';
import { RegisterUserRequestDto } from '../dtos/register-user.dto';
import { RpcException } from '@/core/exceptions/rpc.exception';
import { ErrorCodes } from '@/shared/constants/rp-exception.constant';
import { status as RpcExceptionStatus } from '@grpc/grpc-js';
import { isEmail, isPhoneNumber } from 'class-validator';
import { IVerificationCodeRepository } from '@/core/repositories/verification-code.repository';
import { VERIFICATION_CODE_REPOSITORY_TOKEN } from '@/shared/constants/repository-tokens.constant';
import { Logger } from '@/shared/logger/services/app-logger.service';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    @Inject(VERIFICATION_CODE_REPOSITORY_TOKEN)
    private readonly verificationCodeRepository: IVerificationCodeRepository,
    private readonly logger: Logger,
  ) {}

  async execute(request: RegisterUserRequestDto): Promise<CreateUserResponseDto> {
    this.logger.log('Starting user registration process');
    this.logger.log(`Registering user with email or phone number: ${request.emailOrPhoneNumber}`);
    const { emailOrPhoneNumber, verificationCode } = request;

    if (!verificationCode?.trim()) {
      this.logger.error('Verification code is required but not provided');
      throw new RpcException({
        error: ErrorCodes.INVALID_VERIFICATION_CODE,
        code: RpcExceptionStatus.UNAUTHENTICATED,
      });
    }

    const foundCode = await this.verificationCodeRepository.getVerificationCode(
      emailOrPhoneNumber.trim()?.toLowerCase(),
    );

    if (!foundCode) {
      this.logger.error(`No verification code found for: ${emailOrPhoneNumber}`);
      throw new RpcException({
        error: ErrorCodes.INVALID_VERIFICATION_CODE,
        code: RpcExceptionStatus.UNAUTHENTICATED,
      });
    }

    if (foundCode.code !== verificationCode.trim()) {
      if (foundCode.attempts === 0) {
        this.logger.error(`Verification code attempts exceeded for: ${emailOrPhoneNumber}`);
        await this.verificationCodeRepository.deleteVerificationCode(
          emailOrPhoneNumber.trim()?.toLowerCase(),
        );
      } else {
        this.logger.warn(
          `Invalid verification code for: ${emailOrPhoneNumber}. Attempts left: ${foundCode.attempts - 1}`,
        );
        await this.verificationCodeRepository.updateVerificationCodeAttempts(
          emailOrPhoneNumber.trim()?.toLowerCase(),
          foundCode.attempts - 1,
        );
      }
      throw new RpcException({
        error: ErrorCodes.INVALID_VERIFICATION_CODE,
        code: RpcExceptionStatus.UNAUTHENTICATED,
      });
    }

    const isValidEmail = isEmail(emailOrPhoneNumber.trim());
    const isValidPhoneNumber = isPhoneNumber(emailOrPhoneNumber.trim());

    const createUserReq: CreateUserRequestDto = {
      ...request,
    };

    if (isValidEmail) {
      this.logger.log(`Valid email format detected: ${emailOrPhoneNumber}`);
      createUserReq.email = emailOrPhoneNumber.trim();
      createUserReq.isEmailVerified = true;
    } else if (isValidPhoneNumber) {
      this.logger.log(`Valid phone number format detected: ${emailOrPhoneNumber}`);
      createUserReq.phoneNumber = emailOrPhoneNumber.trim();
      createUserReq.isPhoneNumberVerified = true;
    } else {
      this.logger.error(`Invalid email or phone number format: ${emailOrPhoneNumber}`);
      throw new RpcException({
        error: ErrorCodes.BAD_REQ,
        code: RpcExceptionStatus.INVALID_ARGUMENT,
      });
    }

    const result = await this.createUserUseCase.execute(createUserReq);

    await this.verificationCodeRepository.deleteVerificationCode(
      emailOrPhoneNumber.trim()?.toLowerCase(),
    );

    this.logger.log(`User registered successfully`);
    return result;
  }
}
