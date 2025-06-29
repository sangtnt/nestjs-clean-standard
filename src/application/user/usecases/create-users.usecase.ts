import { IUserRepository } from '@/core/repositories/user.repository';
import { USER_REPOSITORY_TOKEN } from '@/shared/constants/repository-tokens.constant';
import { Inject, Injectable } from '@nestjs/common';
import { CreateUserRequestDto, CreateUserResponseDto } from '../dtos/create-user.dto';
import { RpcException } from '@/core/exceptions/rpc.exception';
import { status as RpcExceptionStatus } from '@grpc/grpc-js';
import { ErrorCodes } from '@/shared/constants/rp-exception.constant';
import * as bcrypt from 'bcrypt';
import { isStrongPassword } from 'class-validator';
import { Logger } from '@/shared/logger/services/app-logger.service';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    private readonly logger: Logger,
  ) {}

  async execute(request: CreateUserRequestDto): Promise<CreateUserResponseDto> {
    this.logger.log('Starting user creation process');
    this.validateCreateUserRequest(request);

    await this.processUserData(request);

    const userExist = await this.userRepository.checkExistUser(request.email, request.phoneNumber);

    if (userExist) {
      this.logger.error('User already exists with the provided email or phone number');
      throw new RpcException({
        error: ErrorCodes.DATA_EXISTS,
        code: RpcExceptionStatus.ALREADY_EXISTS,
      });
    }

    const id = await this.userRepository.save(request);

    this.logger.log(`User created successfully with ID: ${id}`);
    return { id };
  }

  private async processUserData(user: CreateUserRequestDto): Promise<void> {
    this.logger.log('Processing user data for creation');
    user.password = await bcrypt.hash(user.password, 10); // Hash the password with 10 rounds
    user.email = user.email?.trim()?.toLowerCase();
    user.phoneNumber = user.phoneNumber?.trim();
    user.userName = user.userName?.trim()?.toLowerCase();
    user.displayName = user.displayName?.trim();

    if (!user.userName) {
      this.logger.warn('User name not provided, generating a random user name');
      const random = Math.floor(Math.random() * 1000); // Random number (0–999)
      const timestamp = Date.now(); // Milliseconds since epoch
      user.userName = `user_${random}${timestamp}`;
    }

    if (!user.displayName) {
      this.logger.warn('Display name not provided, using user name as display name');
      user.displayName = user.userName;
    }
    this.logger.log('User data processed successfully');
  }

  private validateCreateUserRequest(request: CreateUserRequestDto): void {
    this.logger.log('Validating user creation request');
    const isValidPassword = isStrongPassword(request.password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    });

    if ((!request.email && !request.phoneNumber) || !isValidPassword) {
      this.logger.error(
        'Invalid user creation request: email or phone number is required and password must be strong',
      );
      throw new RpcException({
        error: ErrorCodes.BAD_REQ,
        code: RpcExceptionStatus.INVALID_ARGUMENT,
      });
    }
    this.logger.log('User creation request validated successfully');
  }
}
