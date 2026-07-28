import { ConnectionStatus } from '../../members/entities/enums/connectionStatus.enum';
import { AuthMethod } from '../../members/entities/enums/auth-method.enum';

export class AuthMemberResponseDto {
    id: number;

    nickname: string | null;

    email: string;

    googleId: string | null;

    authMethod: AuthMethod;

    connectionStatus: ConnectionStatus;

    introduction: string | null;

    tokenBalance: number;
}
