import { IsInt, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class ReviewRequest {
    @IsInt()
    @Min(1)
    @Max(5)
    rating: number;

    @IsString()
    @MinLength(10)
    @MaxLength(1000)
    review: string;
}
