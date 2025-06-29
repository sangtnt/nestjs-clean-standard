import { FindUserUseCase } from '@/application/user/usecases/find-user.usecase';
import { LoginRequestDto, LoginResponseDto } from '../dtos/login.dto';
import { TokenService } from '../services/token.service';
import { RpcException } from '@/core/exceptions/rpc.exception';
import { ErrorCodes } from '@/shared/constants/rp-exception.constant';
import { status as RpcExceptionStatus } from '@grpc/grpc-js';
import { Inject, Injectable } from '@nestjs/common';
import { REFRESH_TOKEN_REPOSITORY_TOKEN } from '@/shared/constants/repository-tokens.constant';
import * as bcrypt from 'bcrypt';
import { uuidv7 } from 'uuidv7';
import { IRefreshTokenRepository } from '@/core/repositories/refresh-token.repository';
import { RefreshTokenExpiresMinute } from '@/shared/constants/config.constants';
import { Logger } from '@/shared/logger/services/app-logger.service';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly tokenService: TokenService,
    private findUserUseCase: FindUserUseCase,
    @Inject(REFRESH_TOKEN_REPOSITORY_TOKEN)
    private readonly rfTokenRepository: IRefreshTokenRepository,
    private readonly logger: Logger,
  ) {}

  async execute(request: LoginRequestDto): Promise<LoginResponseDto> {
    this.logger.log('Starting login process');
    this.logger.log(`Login attempt for user: ${request.emailOrPhoneNumber}`);
    const foundUser = await this.findUserUseCase.execute(request.emailOrPhoneNumber);

    if (!foundUser) {
      this.logger.error('User not found during login attempt');
      throw new RpcException({
        error: ErrorCodes.UNAUTHENTICATED,
        code: RpcExceptionStatus.UNAUTHENTICATED,
      });
    }

    const isPasswordValid = await bcrypt.compare(request.password, foundUser.password);

    if (!isPasswordValid) {
      this.logger.error('Invalid password for user');
      throw new RpcException({
        error: ErrorCodes.UNAUTHENTICATED,
        code: RpcExceptionStatus.UNAUTHENTICATED,
      });
    }

    const refreshToken = this.tokenService.generateRefreshToken();
    const accessToken = await this.tokenService.generateAccessToken(foundUser);

    await this.rfTokenRepository.save({
      userId: foundUser.id,
      token: this.tokenService.hashToken(refreshToken),
      expiresAt: new Date(Date.now() + RefreshTokenExpiresMinute * 60 * 1000),
      familyId: uuidv7(),
    });

    this.logger.log('Successfully logged in user');

    return {
      accessToken,
      refreshToken,
      userInfo: foundUser,
    };
  }
}
