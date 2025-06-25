import { DataSource } from 'typeorm';
import 'dotenv/config';
import { join } from 'path';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.NGENZA_AUTH_DB_HOST || 'localhost',
  port: parseInt(process.env.NGENZA_AUTH_DB_PORT || '5432', 10),
  username: process.env.NGENZA_AUTH_DB_USERNAME,
  password: process.env.NGENZA_AUTH_DB_PASSWORD,
  database: process.env.NGENZA_AUTH_DB_DATABASE,
  schema: process.env.NGENZA_AUTH_DB_SCHEMA,
  synchronize: false,
  logging: process.env.NGENZA_AUTH_DB_LOGGING === 'true',
  migrationsRun: false,
  migrationsTableName: 'migrations',
  migrations: [join(__dirname, '..', 'infra/postgres/auth-db/migrations/*{.ts,.js}')],
  entities: [join(__dirname, '..', 'infra/postgres/auth-db/entities/*{.ts,.js}')],
});
