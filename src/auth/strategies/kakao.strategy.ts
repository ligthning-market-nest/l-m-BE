import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-kakao';
import { KakaoProfileDto } from '../dto/kakao-profile.dto';

type KakaoProfileJson = {
  kakao_account?: {
    email?: string;
  };
};

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor() {
    super({
      clientID:
        process.env.KAKAO_REST_API_KEY ??
        process.env.KAKAO_CLIENT_ID ??
        '',
      clientSecret: process.env.KAKAO_CLIENT_SECRET ?? '',
      callbackURL:
        process.env.KAKAO_CALLBACK_URL ??
        'http://localhost:3000/api/auth/login/oauth2/code/kakao',
    });
  }

  authorizationParams(): Record<string, string> {
    return {
      prompt: 'login',
    };
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<KakaoProfileDto> {
    const profileJson = profile._json as KakaoProfileJson;
    const email = profileJson.kakao_account?.email ?? '';

    return {
      kakaoId: String(profile.id),
      email,
    };
  }
}
