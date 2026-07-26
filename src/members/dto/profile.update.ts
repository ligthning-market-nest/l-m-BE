import { IsString, MaxLength, MinLength } from 'class-validator';

export class ProfileUpdate {
    @IsString()
    @MinLength(1)
    @MaxLength(500)
    introduction: string;
}
