import { ConnectionStatus } from '../../members/entities/enums/connectionStatus.enum';
import { AuthMethod } from '../../members/entities/enums/auth-method.enum';

export interface AuthMemberResponse {
  id: number;
  nickname: string;
  email: string;
  googleId: string | null;
  authMethod: AuthMethod;
  connectionStatus: ConnectionStatus;
}

export interface AuthResponse {
  accessToken: string;
  member: AuthMemberResponse;
  isNewMember: boolean;
}
