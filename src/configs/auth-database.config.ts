import DatabaseLoggerService from '@/shared/logger/services/database-logger.service';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { DataSourceOptions } from 'typeorm';
import { EnvSchema } from './env.config';

export const authDatabaseOptions = (
  configService: ConfigService<EnvSchema>,
): DataSourceOptions => ({
  type: 'postgres',
  host: configService.get<string>('AUTH_DB_HOST'),
  port: configService.get<number>('AUTH_DB_PORT'),
  username: configService.get<string>('AUTH_DB_USERNAME'),
  password: configService.get<string>('AUTH_DB_PASSWORD'),
  database: configService.get<string>('AUTH_DB_DATABASE'),
  schema: configService.get<string>('AUTH_DB_SCHEMA'),
  synchronize: false,
  logging: configService.get<boolean>('AUTH_DB_LOGGING'),
  extra: {
    poolSize: 20,
    connectionTimeoutMillis: 2000,
    query_timeout: 1000,
    statement_timeout: 1000,
  },
  entities: [join(__dirname, '..', 'infra/postgres/auth-db/entities/*{.ts,.js}')],
  logger: new DatabaseLoggerService(),
});
