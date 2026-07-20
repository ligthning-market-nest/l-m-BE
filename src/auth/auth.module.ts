import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MemberModule } from '../members/member.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
    imports: [
        ConfigModule,
        MemberModule,
        PassportModule.register({ session: false }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret:
                    configService.get<string>('JWT_ACCESS_SECRET') ??
                    'lightning-market-access-secret',
                signOptions: {
                    expiresIn:
                        (configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '7d') as any,
                },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, GoogleStrategy, JwtStrategy, GoogleAuthGuard, JwtAuthGuard],
    exports: [AuthService],
})
export class AuthModule {}
