import { AuthMethod } from '../../members/entities/member.entity';

export class JwtPayloadDto {
    memberId: number;

    email: string;

    nickname: string | null;

    authMethod: AuthMethod;
}
