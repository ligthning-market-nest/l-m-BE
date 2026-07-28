import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  Profile,
  Strategy,
} from '@arendajaelu/nestjs-passport-apple';
import { AppleProfileDto } from '../dto/apple-profile.dto';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor() {
    super({
      clientID: process.env.APPLE_CLIENT_ID ?? '',
      teamID: process.env.APPLE_TEAM_ID ?? '',
      keyID: process.env.APPLE_KEY_ID ?? '',

      key: (process.env.APPLE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),

      callbackURL:
        process.env.APPLE_CALLBACK_URL ??
        'https://your-domain.com/api/auth/login/oauth2/code/apple',

      scope: ['email', 'name'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<AppleProfileDto> {
    return {
      appleId: profile.id,
      email: profile.email ?? null,
    };
  }
}