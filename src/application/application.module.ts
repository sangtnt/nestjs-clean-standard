import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FindUserUseCase } from './user/usecases/find-user.usecase';
import { CreateUserUseCase } from './user/usecases/create-users.usecase';
import { TokenService } from './auth/services/token.service';
import { LoginUseCase } from './auth/usecases/login.usecase';
import { RegisterUserUseCase } from './auth/usecases/register-user.usecase';
import { SendEmailVerificationUseCase } from './auth/usecases/send-email-verification.usecase';
import { VerifyAccessTokenUseCase } from './auth/usecases/verify-access-token.usecase';
import { InfraModule } from '@/infra/infra.module';
import { readFile } from '@/shared/utils/file.util';
import { RefreshAccessTokenUseCase } from './auth/usecases/refresh-access-token.usecase';

@Module({
  imports: [
    InfraModule,
    JwtModule.registerAsync({
      useFactory: () => {
        const PRIVATE_KEY = readFile('keys/private_key.pem');
        const PUBLIC_KEY = readFile('keys/public_key.pem');
        return {
          privateKey: PRIVATE_KEY,
          publicKey: PUBLIC_KEY,
          signOptions: {
            algorithm: 'RS256',
          },
        };
      },
    }),
  ],
  providers: [
    CreateUserUseCase,
    FindUserUseCase,
    SendEmailVerificationUseCase,
    RegisterUserUseCase,
    TokenService,
    LoginUseCase,
    VerifyAccessTokenUseCase,
    RefreshAccessTokenUseCase,
  ],
  exports: [
    CreateUserUseCase,
    FindUserUseCase,
    SendEmailVerificationUseCase,
    RegisterUserUseCase,
    TokenService,
    LoginUseCase,
    VerifyAccessTokenUseCase,
    RefreshAccessTokenUseCase,
  ],
})
export class ApplicationModule {}
