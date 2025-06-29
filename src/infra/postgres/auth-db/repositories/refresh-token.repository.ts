import { IRefreshTokenRepository } from '@/core/repositories/refresh-token.repository';
import { AbstractRepository } from '../../base/base.repository';
import { RefreshTokenSchema } from '../entities/refresh-token.entity';
import { RefreshTokenEntity } from '@/core/entities/refresh-token.entity';
import { Logger, OnModuleInit } from '@nestjs/common';

export class RefreshTokenRepository
  extends AbstractRepository<RefreshTokenSchema>
  implements IRefreshTokenRepository, OnModuleInit
{
  private logger: Logger;

  onModuleInit(): void {
    this.logger = new Logger(RefreshTokenRepository.name);
  }

  async getTokenInfo(token: string): Promise<RefreshTokenEntity | null> {
    this.logger.log('Searching for refresh token info');
    const result = await this.repository.findOne({
      where: { token },
      select: { id: true, userId: true, expiresAt: true, revokedAt: true, familyId: true },
    });

    this.logger.log('Refresh token info search completed');
    return result;
  }

  async revokeTokenByFamily(familyId: string): Promise<void> {
    this.logger.log(`Revoking all refresh tokens for family ID: ${familyId}`);
    await this.repository.query(
      `
        UPDATE auth_service.refresh_tokens
        SET revoked_at = NOW()
        WHERE family_id = $1    
    `,
      [familyId],
    );
    this.logger.log(`All refresh tokens for family ID ${familyId} have been revoked`);
  }
}
