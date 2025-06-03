import { ConfigService } from '@nestjs/config';
import { ClientProvider, Transport } from '@nestjs/microservices';
import { EnvSchema } from './env.config';

export const kafkaConfigOptions = (configService: ConfigService<EnvSchema>): ClientProvider => ({
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: configService.get<string>('KAFKA_CLIENT_ID'),
      brokers: configService.get<string>('KAFKA_BROKERS')!.split(','),
    },
    consumer: {
      groupId: configService.get<string>('KAFKA_CONSUMER_GROUP_ID')!,
    },
  },
});
