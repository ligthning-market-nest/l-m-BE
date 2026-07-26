import { ConnectionStatus } from '../entities/enums/connectionStatus.enum';

export class ProfileResponse {
    id: number;
    nickname: string | null;
    email: string | null;
    introduction: string | null;
    connectionStatus: ConnectionStatus;
    tokenBalance: number | null;
    followerCount: number;
    followingCount: number;
    followed: boolean;
}
