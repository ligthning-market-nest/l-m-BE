import { JwtSignOptions } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
dotenv.config();


// access token 기간
export const jwtAccessOptions: JwtSignOptions = {
    secret: process.env.JWT_ACCESS_SECRET,
    expiresIn: '30m',
}


//refresh token 기간
export const jwtRefreshOptions: JwtSignOptions = {
    secret: process.env.JWT_REFERESH_SECRET,
    expiresIn: '30d',
}

//grantcode 기간
export const jwtGrantCodeOptions: JwtSignOptions = {
    secret: process.env.JWT_GRANT_SECRET,
    expiresIn: '1m',
}

