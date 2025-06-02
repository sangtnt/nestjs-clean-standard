import appConfig from '@/configs/app.config';
import authDatabaseConfig, { authDatabaseConfigOptions } from '@/configs/auth-database.config';
import { AUTH_DATA_SOURCE, KAFKA_CLIENT_SERVICE } from '@/shared/constants/constants';
import { EnvironmentVariables } from '@/shared/constants/env.constant';
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
import { ClientProviderOptions, ClientsModule, Transport } from '@nestjs/microservices';
import { MailRepository } from './kafka/repositories/mail.repository';
import { RefreshTokenSchema } from './postgres/auth-db/entities/refresh-token.entity';
import { RefreshTokenRepository } from './postgres/auth-db/repositories/refresh-token.repository';
import redisConfig from '@/configs/redis.config';
import { Logger } from '@/shared/logger/services/app-logger.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, authDatabaseConfig],
      cache: true,
    }),
    CacheModule.registerAsync({
      useFactory: (logger: Logger) => {
        const redisStore = redisConfig;
        redisStore.on('error', (err) => {
          logger.error(`Redis connection error ${err}`);
        });
        return { stores: [redisStore] };
      },
      inject: [Logger],
    }),
    ClientsModule.registerAsync({
      clients: [
        {
          useFactory: (configService: ConfigService): ClientProviderOptions => ({
            name: KAFKA_CLIENT_SERVICE,
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId:
                  configService.get<string>(EnvironmentVariables.KAFKA_CLIENT_ID) ||
                  'default-client-id',
                brokers: configService
                  .get<string>(EnvironmentVariables.KAFKA_BROKERS)
                  ?.split(',') || ['localhost:9092'],
              },
              consumer: {
                groupId:
                  configService.get<string>(EnvironmentVariables.KAFKA_CONSUMER_GROUP_ID) ||
                  'default-group',
              },
            },
          }),
          name: KAFKA_CLIENT_SERVICE,
          inject: [ConfigService],
        },
      ],
    }),
  ],
  providers: [
    {
      provide: AUTH_DATA_SOURCE,
      useFactory: (configService: ConfigService): Promise<DataSource> => {
        const dataSource = new DataSource(authDatabaseConfigOptions(configService));

        return dataSource.initialize();
      },
      inject: [ConfigService],
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
