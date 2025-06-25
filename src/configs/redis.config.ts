import { EnvSchema } from '@/shared/interfaces/env-schema';
import { createKeyv, Keyv } from '@keyv/redis';
import { ConfigService } from '@nestjs/config';

export const redisOptions = (configService: ConfigService<EnvSchema>): Keyv =>
  createKeyv({
    url: configService.get<string>('NGENZA_AUTH_REDIS_URL')!,
    socket: {
      tls: false,
      keepAlive: 30000,
      reconnectStrategy: (retries): number => Math.min(retries * 50, 2000),
    },
  });
