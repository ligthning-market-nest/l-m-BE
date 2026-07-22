import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsEnum,
    IsInt,
    IsString,
    Max,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator';
import { Category } from '../entities/category.enum';
import { Status } from '../entities/status.enum';



export class SellRequest {
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    name: string;

    @IsEnum(Status)
    status: Status;


    @IsString()
    @MinLength(1)
    @MaxLength(1000)
    description: string;


    @IsInt()
    @Min(1)
    @MaxLength(2_147_483_647)
    price: number;

    @IsEnum(Category)
    category: Category;

    @IsInt()
    @Max(1000)
    @Min(1)
    stock: number;

    @IsArray()
    @ArrayMaxSize(10)
    @IsString()
    @MaxLength(15, { each: true })
    tags: string[];

    @IsBoolean()
    directTrade: boolean;

    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(10)
    @IsString({ each: true })
    @MaxLength(2048, {  each: true })
    imageUrls: string[];
}