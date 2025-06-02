import { Inject, Injectable } from '@nestjs/common';
import { SendEmailVerificationRequestDto } from '../dtos/send-email-verification.dto';
import {
  MAIL_REPOSITORY_TOKEN,
  USER_REPOSITORY_TOKEN,
  VERIFICATION_CODE_REPOSITORY_TOKEN,
} from '@/shared/constants/repository-tokens.constant';
import { IMailRepository } from '@/core/repositories/mail.repository';
import { IVerificationCodeRepository } from '@/core/repositories/verification-code.repository';
import { VerificationCodeExpiresMinute } from '@/shared/constants/config.constants';
import { IUserRepository } from '@/core/repositories/user.repository';
import { ErrorCodes } from '@/shared/constants/rp-exception.constant';
import { status as RpcExceptionStatus } from '@grpc/grpc-js';
import { RpcException } from '@/core/exceptions/rpc.exception';

@Injectable()
export class SendEmailVerificationUseCase {
  constructor(
    @Inject(MAIL_REPOSITORY_TOKEN) private readonly mailRepository: IMailRepository,
    @Inject(VERIFICATION_CODE_REPOSITORY_TOKEN)
    private readonly verificationCodeRepository: IVerificationCodeRepository,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(request: SendEmailVerificationRequestDto): Promise<void> {
    const userExist = await this.userRepository.checkExistUser(request.email);

    if (userExist) {
      throw new RpcException({
        error: ErrorCodes.DATA_EXISTS,
        code: RpcExceptionStatus.ALREADY_EXISTS,
      });
    }

    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    await this.verificationCodeRepository.saveVerificationCode(
      {
        id: request.email,
        code: `${verificationCode}`,
        attempts: 5,
      },
      VerificationCodeExpiresMinute * 60 * 1000,
    );

    await this.mailRepository.sendEmailVerificationCode({
      to: [request.email.trim().toLowerCase()],
      subject: 'Email Verification',
      data: {
        name: request.email.split('@')[0],
        verificationCode: verificationCode,
        codeExpirationMinutes: VerificationCodeExpiresMinute,
      },
    });
  }
}
