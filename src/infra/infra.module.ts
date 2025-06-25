import { authDatabaseOptions } from '@/configs/auth-database.config';
import { AUTH_DATA_SOURCE, KAFKA_CLIENT_SERVICE } from '@/shared/constants/constants';
import {
  MAIL_REPOSITORY_TOKEN,
  REFRESH_TOKEN_REPOSITORY_TOKEN,
  USER_REPOSITORY_TOKEN,
  VERIFICATION_CODE_REPOSITORY_TOKEN,
} from '@/shared/constants/repository-tokens.constant';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { UserSchema } from './postgres/auth-db/entities/user.entity';
import { UserRepository } from './postgres/auth-db/repositories/user.repository';
import { VerificationCodeRepository } from './redis/repositories/verification-code.repository';
import { ClientProvider, ClientsModule } from '@nestjs/microservices';
import { MailRepository } from './kafka/repositories/mail.repository';
import { RefreshTokenSchema } from './postgres/auth-db/entities/refresh-token.entity';
import { RefreshTokenRepository } from './postgres/auth-db/repositories/refresh-token.repository';
import { redisOptions } from '@/configs/redis.config';
import { Logger } from '@/shared/logger/services/app-logger.service';
import { kafkaConfigOptions } from '@/configs/kafka.config';
import { envValidationSchema } from '@/configs/env.config';
import { EnvSchema } from '@/shared/interfaces/env-schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
      validationSchema: envValidationSchema,
    }),
    CacheModule.registerAsync({
      useFactory: (logger: Logger, configService: ConfigService<EnvSchema>) => {
        const redisStore = redisOptions(configService);
        redisStore.on('error', (err) => {
          logger.error(`Redis connection error ${err}`);
        });
        return { stores: [redisStore] };
      },
      inject: [Logger, ConfigService<EnvSchema>],
    }),
    ClientsModule.registerAsync([
      {
        useFactory: (configService: ConfigService<EnvSchema>): ClientProvider =>
          kafkaConfigOptions(configService),
        inject: [ConfigService<EnvSchema>],
        name: KAFKA_CLIENT_SERVICE,
      },
    ]),
  ],
  providers: [
    {
      provide: AUTH_DATA_SOURCE,
      useFactory: (configService: ConfigService<EnvSchema>): Promise<DataSource> => {
        const dataSource = new DataSource(authDatabaseOptions(configService));

        return dataSource.initialize();
      },
      inject: [ConfigService<EnvSchema>],
    },
    {
      provide: USER_REPOSITORY_TOKEN,
      useFactory: (dataSource: DataSource): UserRepository =>
        new UserRepository(dataSource.getRepository(UserSchema)),
      inject: [AUTH_DATA_SOURCE],
    },
    {
      provide: REFRESH_TOKEN_REPOSITORY_TOKEN,
      useFactory: (dataSource: DataSource): RefreshTokenRepository =>
        new RefreshTokenRepository(dataSource.getRepository(RefreshTokenSchema)),
      inject: [AUTH_DATA_SOURCE],
    },
    {
      provide: VERIFICATION_CODE_REPOSITORY_TOKEN,
      useClass: VerificationCodeRepository,
    },
    {
      provide: MAIL_REPOSITORY_TOKEN,
      useClass: MailRepository,
    },
  ],
  exports: [
    USER_REPOSITORY_TOKEN,
    VERIFICATION_CODE_REPOSITORY_TOKEN,
    MAIL_REPOSITORY_TOKEN,
    REFRESH_TOKEN_REPOSITORY_TOKEN,
  ],
})
export class InfraModule {}
