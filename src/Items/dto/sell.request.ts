import {
    ArrayMaxSize,
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
import { Transform, Type } from 'class-transformer';
import { Category } from '../entities/category.enum';
import { Status } from '../entities/status.enum';

function parseJsonArray(value: unknown): unknown {
    if (Array.isArray(value) || typeof value !== 'string') {
        return value;
    }

    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}

function parseBoolean(value: unknown): unknown {
    if (value === 'true') {
        return true;
    }

    if (value === 'false') {
        return false;
    }

    return value;
}

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


    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(2_147_483_647)
    price: number;

    @IsEnum(Category)
    category: Category;

    @Type(() => Number)
    @IsInt()
    @Max(1000)
    @Min(1)
    stock: number;

    @Transform(({ value }) => parseJsonArray(value))
    @IsArray()
    @ArrayMaxSize(10)
    @IsString({ each: true })
    @MaxLength(15, { each: true })
    tags: string[];

    @Transform(({ value }) => parseBoolean(value))
    @IsBoolean()
    directTrade: boolean;
}
