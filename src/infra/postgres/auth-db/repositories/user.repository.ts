import { UserSchema } from '../entities/user.entity';
import { IUserRepository } from '@/core/repositories/user.repository';
import { AbstractRepository } from '../../base/base.repository';
import { Logger, OnModuleInit } from '@nestjs/common';

export class UserRepository
  extends AbstractRepository<UserSchema>
  implements IUserRepository, OnModuleInit
{
  private logger: Logger;
  onModuleInit(): void {
    this.logger = new Logger(UserRepository.name);
  }
  async checkExistUser(email?: string, phoneNumber?: string): Promise<boolean> {
    this.logger.log(`Checking if user exists with email: ${email}, phoneNumber: ${phoneNumber}`);
    const conditions: Record<string, string>[] = [];

    if (email) {
      conditions.push({ email });
    }

    if (phoneNumber) {
      conditions.push({ phoneNumber });
    }

    if (conditions.length === 0) {
      return Promise.resolve(true);
    }

    const result = await this.repository.existsBy(conditions);

    this.logger.log('Completed checking user existence');

    return result;
  }

  async findUser(email?: string, phoneNumber?: string): Promise<UserSchema | null> {
    this.logger.log(`Finding user by email: ${email}, phoneNumber: ${phoneNumber}`);
    const result = await this.repository.findOneBy({ email, phoneNumber });

    this.logger.log('User search completed');

    return result;
  }
}
