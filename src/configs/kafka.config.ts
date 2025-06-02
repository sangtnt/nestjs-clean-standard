import { ClientProvider, Transport } from '@nestjs/microservices';
import 'dotenv/config';

const kafkaConfig: ClientProvider = {
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: process.env.KAFKA_CLIENT_ID || 'default-client-id',
      brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
    },
    consumer: {
      groupId: process.env.KAFKA_CONSUMER_GROUP_ID || 'default-group',
    },
  },
};

export default kafkaConfig;
