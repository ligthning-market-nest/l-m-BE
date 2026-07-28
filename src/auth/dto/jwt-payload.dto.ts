import { AuthMethod } from '../../members/entities/enums/auth-method.enum';

export class JwtPayloadDto {
    memberId: number;

    email: string;

    nickname: string | null;

    authMethod: AuthMethod;
}
