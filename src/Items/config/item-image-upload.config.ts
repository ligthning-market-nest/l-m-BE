import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { join } from 'path';

export const ITEM_IMAGE_MAX_COUNT = 10;
export const ITEM_IMAGE_MAX_SIZE = 20 * 1024 * 1024;
export const ITEM_IMAGE_DIRECTORY = join(process.cwd(), 'uploads', 'items');

const allowedMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
]);

const extensionByMimeType: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
};

mkdirSync(ITEM_IMAGE_DIRECTORY, { recursive: true });

export const itemImageUploadOptions = {
    storage: diskStorage({
        destination: ITEM_IMAGE_DIRECTORY,
        filename: (
            request: unknown,
            file: { mimetype: string },
            callback: (error: Error | null, filename: string) => void,
        ) => {
            const extension = extensionByMimeType[file.mimetype] ?? '';
            callback(null, `${randomUUID()}${extension}`);
        },
    }),
    limits: {
        files: ITEM_IMAGE_MAX_COUNT,
        fileSize: ITEM_IMAGE_MAX_SIZE,
    },
    fileFilter: (
        request: unknown,
        file: { mimetype: string },
        callback: (error: Error | null, acceptFile: boolean) => void,
    ) => {
        if (!allowedMimeTypes.has(file.mimetype)) {
            callback(
                new BadRequestException(
                    '상품 이미지는 JPEG, PNG, WebP 형식만 등록할 수 있습니다.',
                ),
                false,
            );
            return;
        }

        callback(null, true);
    },
};
