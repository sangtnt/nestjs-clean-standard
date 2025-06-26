import { EnvSchema } from '@/shared/interfaces/env-schema';
import { ConfigService } from '@nestjs/config';
import { ClientProvider, Transport } from '@nestjs/microservices';

export const kafkaConfigOptions = (configService: ConfigService<EnvSchema>): ClientProvider => ({
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: configService.get<string>('NGENZA_KAFKA_CLIENT_ID'),
      brokers: configService.get<string>('NGENZA_KAFKA_BROKERS')!.split(','),
      connectionTimeout: 10000,
      requestTimeout: 10000,
    },
    consumer: {
      groupId: configService.get<string>('NGENZA_KAFKA_CONSUMER_GROUP_ID')!,
    },
  },
});
