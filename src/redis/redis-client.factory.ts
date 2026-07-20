import { FactoryProvider } from '@nestjs/common';
import Redis from 'ioredis';

export const RedisClientFactory: FactoryProvider<Redis> = {
  provide: 'RedisClient',
  useFactory: () => {
    const redisInstance = new Redis({
      host: process.env.REDIS_HOST ?? '127.0.0.1',
      port: Number(process.env.REDIS_PORT ?? 6379),
      lazyConnect: false,
    });

    redisInstance.on('error', (error) => {
      console.error(`Redis connection failed: ${error.message}`);
    });

    return redisInstance;
  },
};
