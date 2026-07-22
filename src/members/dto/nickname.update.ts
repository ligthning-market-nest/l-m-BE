import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

// 닉네임 변경
export class NicknameUpdate {
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    nickname: string;
}
