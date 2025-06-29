import { VerificationCodeEntity } from '@/core/entities/verification-code.entity';
import { IVerificationCodeRepository } from '@/core/repositories/verification-code.repository';
import { VerificationCodeExpiresMinute } from '@/shared/constants/config.constants';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject, OnModuleDestroy } from '@nestjs/common';
import { Logger } from '@/shared/logger/services/app-logger.service';

export class VerificationCodeRepository implements IVerificationCodeRepository, OnModuleDestroy {
  constructor(
    @Inject(CACHE_MANAGER) private redisServiceClient: Cache,
    private readonly logger: Logger,
  ) {}

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Disconnecting Redis client on module destroy');
    await this.redisServiceClient.disconnect();
    this.logger.log('Redis client disconnected successfully');
  }

  async saveVerificationCode(entity: VerificationCodeEntity, ttl?: number): Promise<void> {
    this.logger.log(`Saving verification code for ID: ${entity.id}`);
    const { id, code, attempts } = entity;
    await this.redisServiceClient.mset([
      { key: `verification_code:${id}`, value: code, ttl },
      {
        key: `verification_code:remaining_attempts:${id}`,
        value: attempts.toString(),
        ttl: ttl,
      },
    ]);
    this.logger.log(`Verification code saved for ID: ${id}`);
  }

  async updateVerificationCodeAttempts(id: string, attempts: number): Promise<void> {
    this.logger.log(
      `Updating verification code attempts for ID: ${id}, attempts left: ${attempts}`,
    );
    await this.redisServiceClient.set(
      `verification_code:remaining_attempts:${id}`,
      attempts.toString(),
      VerificationCodeExpiresMinute * 60 * 1000,
    );
    this.logger.log(`Verification code attempts updated for ID: ${id}`);
  }

  async getVerificationCode(id: string): Promise<VerificationCodeEntity | null> {
    this.logger.log(`Retrieving verification code for ID: ${id}`);
    const [code, attempts] = await this.redisServiceClient.mget<string>([
      `verification_code:${id}`,
      `verification_code:remaining_attempts:${id}`,
    ]);

    if (code === null || attempts === null) {
      return null;
    }

    this.logger.log(`Verification code retrieved for ID: ${id}`);
    return {
      id: id,
      code: code,
      attempts: parseInt(attempts, 10),
    };
  }

  async deleteVerificationCode(id: string): Promise<void> {
    this.logger.log(`Deleting verification code for ID: ${id}`);
    await this.redisServiceClient.mdel([
      `verification_code:${id}`,
      `verification_code:remaining_attempts:${id}`,
    ]);
    this.logger.log(`Verification code deleted for ID: ${id}`);
  }
}
