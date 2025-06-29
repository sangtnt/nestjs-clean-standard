import { LoginUseCase } from '@/application/auth/usecases/login.usecase';
import { RegisterUserUseCase } from '@/application/auth/usecases/register-user.usecase';
import { RefreshAccessTokenUseCase } from '@/application/auth/usecases/refresh-access-token.usecase';
import { SendEmailVerificationUseCase } from '@/application/auth/usecases/send-email-verification.usecase';
import { VerifyAccessTokenUseCase } from '@/application/auth/usecases/verify-access-token.usecase';
import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  SendVerificationCodeRequest,
  RegisterRequest,
  LoginRequest,
  LoginResponse,
  VerifyAccessTokenRequest,
  RefreshAccessTokenRequest,
  RefreshAccessTokenResponse,
  AUTH_SERVICE_NAME,
  AuthServiceControllerMethods,
} from '@ngenza-protobuf/ngenza-auth/ngenza_auth/auth/v1/auth';
import { SilentRequestBody } from '@/shared/logger/decorators/silent-request-body.decorators';
import { SilentRequestLog } from '@/shared/logger/decorators/silent-request-log.decorators';
import { SilentResponseLog } from '@/shared/logger/decorators/silent-response-log.decorators';

@AuthServiceControllerMethods()
@Controller(AUTH_SERVICE_NAME)
export class AuthController {
  constructor(
    @Inject(SendEmailVerificationUseCase)
    private readonly sendEmailVerificationUseCase: SendEmailVerificationUseCase,
    @Inject(RegisterUserUseCase)
    private readonly registerUserUseCase: RegisterUserUseCase,
    @Inject(LoginUseCase)
    private readonly loginUseCase: LoginUseCase,
    @Inject(VerifyAccessTokenUseCase)
    private readonly verifyAccessTokenUseCase: VerifyAccessTokenUseCase,
    @Inject(RefreshAccessTokenUseCase)
    private readonly refreshAccessTokenUseCase: RefreshAccessTokenUseCase,
  ) {}

  @SilentResponseLog()
  @GrpcMethod(AUTH_SERVICE_NAME, 'sendVerificationCode')
  async sendVerificationCode(request: SendVerificationCodeRequest): Promise<void> {
    await this.sendEmailVerificationUseCase.execute(request);
  }

  @SilentRequestLog()
  @SilentResponseLog()
  @GrpcMethod(AUTH_SERVICE_NAME, 'register')
  async register(request: RegisterRequest): Promise<void> {
    await this.registerUserUseCase.execute(request);
  }

  @SilentRequestLog()
  @SilentResponseLog()
  @GrpcMethod(AUTH_SERVICE_NAME, 'login')
  login(request: LoginRequest): Promise<LoginResponse> {
    return this.loginUseCase.execute(request);
  }

  @SilentRequestLog()
  @SilentResponseLog()
  @GrpcMethod(AUTH_SERVICE_NAME, 'verifyAccessToken')
  async verifyAccessToken(request: VerifyAccessTokenRequest): Promise<void> {
    await this.verifyAccessTokenUseCase.execute(request.accessToken);
  }

  @SilentRequestLog()
  @SilentResponseLog()
  @GrpcMethod(AUTH_SERVICE_NAME, 'refreshAccessToken')
  async refreshAccessToken(
    request: RefreshAccessTokenRequest,
  ): Promise<RefreshAccessTokenResponse> {
    return this.refreshAccessTokenUseCase.execute(request);
  }
}
