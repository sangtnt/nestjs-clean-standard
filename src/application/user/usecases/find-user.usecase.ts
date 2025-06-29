import { IUserRepository } from '@/core/repositories/user.repository';
import { USER_REPOSITORY_TOKEN } from '@/shared/constants/repository-tokens.constant';
import { Inject, Injectable } from '@nestjs/common';
import { isEmail, isPhoneNumber } from 'class-validator';
import { UserEntity } from '@/core/entities/user.entity';
import { Logger } from '@/shared/logger/services/app-logger.service';

@Injectable()
export class FindUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN) private readonly userRepository: IUserRepository,
    private readonly logger: Logger,
  ) {}

  async execute(id: string): Promise<UserEntity | null> {
    this.logger.log(`Finding user with ID, email, or phone number: ${id}`);
    const isValidEmail = isEmail(id);
    const isValidPhoneNumber = isPhoneNumber(id);

    let foundUser: UserEntity | null = null;

    if (isValidEmail) {
      this.logger.log(`Searching user by email: ${id}`);
      foundUser = await this.userRepository.findUser(id);
    } else if (isValidPhoneNumber) {
      this.logger.log(`Searching user by phone number: ${id}`);
      foundUser = await this.userRepository.findUser(undefined, id);
    } else {
      this.logger.log(`Searching user by ID: ${id}`);
      foundUser = await this.userRepository.findById(id);
    }

    if (!foundUser || !foundUser.isActive) {
      this.logger.warn(`User not found or inactive for ID, email, or phone number: ${id}`);
      return null;
    }

    this.logger.log(`User found: ${foundUser.id}`);
    return foundUser;
  }
}
