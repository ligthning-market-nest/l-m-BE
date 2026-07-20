/*
declare module 'passport-jwt' {
  import { Request } from 'express';

  export interface StrategyOptions {
    jwtFromRequest: (request: Request) => string | null;
    secretOrKey: string;
    ignoreExpiration?: boolean;
  }

  export class Strategy {
    constructor(
      options: StrategyOptions,
      verify: (...args: unknown[]) => void,
    );
  }

  export const ExtractJwt: {
    fromAuthHeaderAsBearerToken(): (request: Request) => string | null;
  };
}
*/
