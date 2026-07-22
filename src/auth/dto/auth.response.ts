import { AuthMemberResponseDto } from './auth.member.response';

export class AuthResponseDto {
  accessToken: string;

  member: AuthMemberResponseDto;

  isNewMember: boolean;
}
