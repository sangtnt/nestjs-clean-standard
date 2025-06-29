import { Injectable } from '@nestjs/common';
import { TokenService } from '../services/token.service';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';
import { RpcException } from '@/core/exceptions/rpc.exception';
import { ErrorCodes } from '@/shared/constants/rp-exception.constant';
import { status as RpcExceptionStatus } from '@grpc/grpc-js';
import { Logger } from '@/shared/logger/services/app-logger.service';

@Injectable()
export class VerifyAccessTokenUseCase {
  constructor(
    private readonly tokenService: TokenService,
    private readonly logger: Logger,
  ) {}
  async execute(token: string): Promise<void> {
    try {
      this.logger.log('Starting access token verification process');
      await this.tokenService.verifyAccessToken(token);
      this.logger.log('Access token successfully verified');
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        this.logger.error('Access token has expired');
        throw new RpcException({
          error: ErrorCodes.TOKEN_EXPIRED,
          code: RpcExceptionStatus.DEADLINE_EXCEEDED,
        });
      }
      if (error instanceof JsonWebTokenError) {
        this.logger.error('Invalid access token');
        throw new RpcException({
          error: ErrorCodes.UNAUTHENTICATED,
          code: RpcExceptionStatus.UNAUTHENTICATED,
        });
      }
      this.logger.error('An unexpected error occurred during access token verification');
      throw error;
    }
  }
}
