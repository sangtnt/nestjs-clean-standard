import * as Joi from 'joi';

export interface EnvSchema {
  // Environment variables for the application
  NODE_ENV: string;
  GRPC_PORT: string;
  HOST: string;
  TIMEOUT: number;

  // Database configuration for auth service
  AUTH_DB_HOST: string;
  AUTH_DB_PORT: number;
  AUTH_DB_USERNAME: string;
  AUTH_DB_PASSWORD: string;
  AUTH_DB_DATABASE: string;
  AUTH_DB_SCHEMA: string;
  AUTH_DB_LOGGING: boolean;

  // Redis configuration for auth service
  AUTH_REDIS_URL: string;

  // Kafka configuration for auth service
  KAFKA_BROKERS: string;
  KAFKA_CLIENT_ID: string;
  KAFKA_CONSUMER_GROUP_ID: string;

  // Kafka topics and templates for notifications
  KAFKA_NOTI_EMAIL_VERIFICATION_TOPIC: string;
  KAFKA_NOTI_EMAIL_VERIFICATION_TEMPLATE_ID: string;
}

export const envValidationSchema: Joi.ObjectSchema<EnvSchema> = Joi.object<EnvSchema>({
  NODE_ENV: Joi.string().valid('local', 'development', 'test', 'staging', 'production').required(),
  GRPC_PORT: Joi.number().port().required(),
  HOST: Joi.string().hostname().required(),
  TIMEOUT: Joi.number().integer().min(1000).default(30000),

  AUTH_DB_HOST: Joi.string().hostname().required(),
  AUTH_DB_PORT: Joi.number().port().default(5432),
  AUTH_DB_USERNAME: Joi.string().required(),
  AUTH_DB_PASSWORD: Joi.string().required(),
  AUTH_DB_DATABASE: Joi.string().required(),
  AUTH_DB_SCHEMA: Joi.string().default('public'),
  AUTH_DB_LOGGING: Joi.boolean().default(false),

  AUTH_REDIS_URL: Joi.string().uri().required(),
  KAFKA_BROKERS: Joi.string().required(),
  KAFKA_CLIENT_ID: Joi.string().required(),
  KAFKA_CONSUMER_GROUP_ID: Joi.string().required(),

  KAFKA_NOTI_EMAIL_VERIFICATION_TOPIC: Joi.string().required(),
  KAFKA_NOTI_EMAIL_VERIFICATION_TEMPLATE_ID: Joi.string().required(),
});
