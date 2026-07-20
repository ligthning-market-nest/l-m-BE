import { AuthMemberResponseDto } from './auth-member-response.dto';

export class AuthResponseDto {
    accessToken: string;

    member: AuthMemberResponseDto;

    isNewMember: boolean;
}
