import { Injectable } from '@nestjs/common';
import { RedisRepository } from './redis.repository';

@Injectable()
export class RedisService {
    constructor(private readonly redisRepository: RedisRepository) {}

    async setRefreshToken(
        memberId: number,
        refreshToken: string,
        expiry: number,
    ): Promise<void> {
        await this.redisRepository.setWithExpiry(
            'refresh_token',
            String(memberId),
            refreshToken,
            expiry,
        );
    }

    async getRefreshToken(memberId: number): Promise<string | null> {
        return this.redisRepository.get('refresh_token', String(memberId));
    }

    async deleteRefreshToken(memberId: number): Promise<void> {
        await this.redisRepository.delete('refresh_token', String(memberId));
    }

    async setGrantCode(memberId: number, code: string): Promise<void> {
        await this.redisRepository.setWithExpiry(
            'grant_code',
            String(memberId),
            code,
            Number(process.env.GRANT_CODE_EXPIRES_IN ?? 300),
        );
    }

    async getGrantCode(memberId: number): Promise<string | null> {
        return this.redisRepository.get('grant_code', String(memberId));
    }

    async deleteGrantCode(memberId: number): Promise<void> {
        await this.redisRepository.delete('grant_code', String(memberId));
    }
}
