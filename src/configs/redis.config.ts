import { createKeyv } from '@keyv/redis';
import 'dotenv/config';

export default createKeyv({
  url: process.env.AUTH_REDIS_URL || '',
  socket: {
    tls: false,
    keepAlive: 30000,
    reconnectStrategy: (retries): number => Math.min(retries * 50, 2000),
  },
});
