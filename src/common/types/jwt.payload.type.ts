import { AuthMethod } from "src/members/entities/enums/auth-method.enum";

export interface JwtPayload {
  memberId: number;
  email: string;
  nickname: string | null;
  authMethod: AuthMethod;
}
