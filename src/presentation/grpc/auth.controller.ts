import { LoginUseCase } from '@/application/auth/usecases/login.usecase';
import { RegisterUserUseCase } from '@/application/auth/usecases/register-user.usecase';
import { RenewAccessTokenUseCase } from '@/application/auth/usecases/renew-access-token.usecase';
import { SendEmailVerificationUseCase } from '@/application/auth/usecases/send-email-verification.usecase';
import { VerifyAccessTokenUseCase } from '@/application/auth/usecases/verify-access-token.usecase';
import { Timeout } from '@/shared/decorators/time-out.decorator';
import { Inject } from '@nestjs/common';
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

@AuthServiceControllerMethods()
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
    @Inject(RenewAccessTokenUseCase)
    private readonly renewAccessTokenUseCase: RenewAccessTokenUseCase,
  ) {}

  @Timeout(10000) // 10 seconds timeout
  @GrpcMethod(AUTH_SERVICE_NAME, 'sendVerificationCode')
  async sendVerificationCode(request: SendVerificationCodeRequest): Promise<void> {
    await this.sendEmailVerificationUseCase.execute(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'register')
  async register(request: RegisterRequest): Promise<void> {
    await this.registerUserUseCase.execute(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'login')
  login(request: LoginRequest): Promise<LoginResponse> {
    return this.loginUseCase.execute(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'verifyAccessToken')
  async verifyAccessToken(request: VerifyAccessTokenRequest): Promise<void> {
    await this.verifyAccessTokenUseCase.execute(request.accessToken);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'refreshAccessToken')
  async refreshAccessToken(
    request: RefreshAccessTokenRequest,
  ): Promise<RefreshAccessTokenResponse> {
    return this.renewAccessTokenUseCase.execute(request);
  }
}
