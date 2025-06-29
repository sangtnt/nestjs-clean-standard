import { EnvSchema } from '@/shared/interfaces/env-schema';
import * as Joi from 'joi';

export const envValidationSchema: Joi.ObjectSchema<EnvSchema> = Joi.object<EnvSchema>({
  NODE_ENV: Joi.string().valid('local', 'development', 'test', 'staging', 'production').required(),
  GRPC_PORT: Joi.number().port().required(),
  APP_PORT: Joi.number().port().required(),
  HOST: Joi.string().hostname().required(),
  TIMEOUT: Joi.number().integer().min(1000).default(30000),
  LOG_LEVEL: Joi.string()
    .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent')
    .default('info'),

  NGENZA_AUTH_DB_HOST: Joi.string().hostname().required(),
  NGENZA_AUTH_DB_PORT: Joi.number().port().default(5432),
  NGENZA_AUTH_DB_USERNAME: Joi.string().required(),
  NGENZA_AUTH_DB_PASSWORD: Joi.string().required(),
  NGENZA_AUTH_DB_DATABASE: Joi.string().required(),
  NGENZA_AUTH_DB_SCHEMA: Joi.string().default('public'),
  NGENZA_AUTH_DB_LOGGING: Joi.boolean().default(false),

  NGENZA_AUTH_REDIS_URL: Joi.string().uri().required(),
  NGENZA_KAFKA_BROKERS: Joi.string().required(),
  NGENZA_KAFKA_CLIENT_ID: Joi.string().required(),
  NGENZA_KAFKA_CONSUMER_GROUP_ID: Joi.string().required(),

  NGENZA_KAFKA_NOTI_EMAIL_VERIFICATION_TOPIC: Joi.string().required(),
  NGENZA_KAFKA_NOTI_EMAIL_VERIFICATION_TEMPLATE_ID: Joi.string().required(),
});
