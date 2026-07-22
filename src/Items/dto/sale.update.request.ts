import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator';

import { Category } from '../entities/category.enum';
import { Status } from '../entities/status.enum';

export class SaleUpdateRequest {


    @IsOptional()   //값 입력 안해도 됨 기존 값 유지
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    name?: string; //상품 이름


    @IsOptional()
    @IsEnum(Status)
    status?: Status;


    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(1000)
    description?: string;

    @IsOptional()
    @IsInt()
    @Max(2_147_483_647) //_은 숫자 구분 타입스트립트 문법
    @Min(0)
    price?: number;

    @IsOptional()
    @IsInt()
    @Max(1000)
    @Min(0)
    stock?: number;

    @IsOptional()
    @IsEnum(Category)
    category?: Category;


    @IsOptional()
    @IsArray()
    @ArrayMaxSize(10) //
    @IsString({ each: true })
    @MaxLength(15, { each: true })
    tags?: string[];


    @IsOptional()
    @IsBoolean()
    directTrade?: boolean;

    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(10)
    @IsString({ each: true })
    @MaxLength(2048, { each: true })
    imageUrls?: string[];

}