import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { config } from 'dotenv';

async function bootstrap() {
    config();
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    const frontendOrigins = [
        ...(process.env.FRONTEND_URL ?? 'http://localhost:5173')
            .split(',')
            .map((origin) => origin.trim()),
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ];

    app.enableCors({
        origin: frontendOrigins,
        credentials: true,
    });
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
        }),
    );
    app.setGlobalPrefix('api');
    app.useStaticAssets(join(process.cwd(), 'uploads'), {
        prefix: '/uploads/',
    });

    await app.listen(Number(process.env.PORT ?? 3000));
}

bootstrap();
