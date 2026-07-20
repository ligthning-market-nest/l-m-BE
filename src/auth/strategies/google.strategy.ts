import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { GoogleProfileDto } from '../dto/google-profile.dto';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor() {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID ?? '',
            clientSecret: process.env.GOOGLE_SECRET ?? '',
            callbackURL:
                process.env.GOOGLE_CALLBACK_URL ??
                'http://localhost:3000/api/auth/login/oauth2/code/google',
            scope: ['email', 'profile'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
    ): Promise<GoogleProfileDto> {
        const email = profile.emails?.[0]?.value ?? '';
        const nickname = profile.displayName || email.split('@')[0] || 'user';

        return {
            googleId: profile.id,
            email,
            nickname,
        };
    }
}
