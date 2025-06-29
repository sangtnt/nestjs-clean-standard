import { MailEntity } from '@/core/entities/mail.entity';
import { IMailRepository } from '@/core/repositories/mail.repository';
import { KAFKA_CLIENT_SERVICE } from '@/shared/constants/constants';
import { EnvSchema } from '@/shared/interfaces/env-schema';
import { Logger } from '@/shared/logger/services/app-logger.service';
import { Inject, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

export class MailRepository implements OnModuleInit, OnApplicationShutdown, IMailRepository {
  constructor(
    @Inject(KAFKA_CLIENT_SERVICE) private readonly kafkaClient: ClientKafka,
    private logger: Logger,
    @Inject(ConfigService) private readonly configService: ConfigService<EnvSchema>,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      this.logger.log('Connecting Kafka Producer client...');
      await this.kafkaClient.connect();
      this.logger.log('Kafka Producer client connected successfully.');
    } catch (error) {
      this.logger.error(`Failed to connect Kafka Producer client: ${JSON.stringify(error)}`);
    }
  }

  async onApplicationShutdown(): Promise<void> {
    this.logger.log('Closing Kafka Producer client...');
    await this.kafkaClient.close();
    this.logger.log('Kafka Producer client closed.');
  }

  async sendEmailVerificationCode(req: MailEntity): Promise<void> {
    this.logger.log(`Sending message to Kafka topic email-verification`);
    await lastValueFrom(
      this.kafkaClient.emit(
        this.configService.get<string>('NGENZA_KAFKA_NOTI_EMAIL_VERIFICATION_TOPIC'),
        {
          value: {
            ...req,
            dynamicTemplateData: {
              ...req.data,
            },
            templateId: this.configService.get<string>(
              'NGENZA_KAFKA_NOTI_EMAIL_VERIFICATION_TEMPLATE_ID',
            ),
          },
        },
      ),
    );
    this.logger.log(`Message sent to Kafka topic email-verification`);
  }
}
