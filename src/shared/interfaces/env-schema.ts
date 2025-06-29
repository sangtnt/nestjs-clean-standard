export interface EnvSchema {
  // Environment variables for the application
  APP_PORT: number;
  NODE_ENV: string;
  GRPC_PORT: string;
  HOST: string;
  TIMEOUT: number;
  LOG_LEVEL: string;

  // Database configuration for auth service
  NGENZA_AUTH_DB_HOST: string;
  NGENZA_AUTH_DB_PORT: number;
  NGENZA_AUTH_DB_USERNAME: string;
  NGENZA_AUTH_DB_PASSWORD: string;
  NGENZA_AUTH_DB_DATABASE: string;
  NGENZA_AUTH_DB_SCHEMA: string;
  NGENZA_AUTH_DB_LOGGING: boolean;

  // Redis configuration for auth service
  NGENZA_AUTH_REDIS_URL: string;

  // Kafka configuration for auth service
  NGENZA_KAFKA_BROKERS: string;
  NGENZA_KAFKA_CLIENT_ID: string;
  NGENZA_KAFKA_CONSUMER_GROUP_ID: string;

  // Kafka topics and templates for notifications
  NGENZA_KAFKA_NOTI_EMAIL_VERIFICATION_TOPIC: string;
  NGENZA_KAFKA_NOTI_EMAIL_VERIFICATION_TEMPLATE_ID: string;
}
