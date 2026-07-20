import { Module } from '@nestjs/common'
import { RedisService } from './redis.service'
import { RedisRepository } from './redis.repository'
import { RedisClientFactory } from './redis-client.factory'

@Module({
    providers: [RedisClientFactory, RedisService, RedisRepository],
    exports: [RedisService],
})

export class RedisModule {}

