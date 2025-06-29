import { JwtService } from '@nestjs/jwt';
import { uuidv7 } from 'uuidv7';
import { Injectable } from '@nestjs/common';
import { UserEntity } from '@/core/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { AccessTokenExpiresMinute } from '@/shared/constants/config.constants';
import * as crypto from 'crypto';
import { Logger } from '@/shared/logger/services/app-logger.service';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly logger: Logger,
  ) {}
  async generateAccessToken(payload: UserEntity): Promise<string> {
    this.logger.log(`Generating access token for user: ${payload.userName}`);
    const token = this.jwtService.signAsync(
      {
        iss: 'auth-service',
        jti: uuidv7(),
        sub: payload.userName,
        user: plainToInstance(UserEntity, payload),
      },
      {
        expiresIn: `${AccessTokenExpiresMinute}m`,
      },
    );

    this.logger.log(`Access token generated for user: ${payload.userName}`);

    return token;
  }

  generateRefreshToken(): string {
    this.logger.log('Generating refresh token');
    const token = crypto.randomBytes(32).toString('base64url');

    this.logger.log('Refresh token generated successfully');
    return token;
  }

  hashToken(token: string): string {
    this.logger.log('Hashing token');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    this.logger.log('Token hashed successfully');
    return hashedToken;
  }

  async verifyAccessToken(token: string): Promise<void> {
    this.logger.log('Verifying access token');
    await this.jwtService.verifyAsync(token);
    this.logger.log('Access token verified successfully');
  }
}
