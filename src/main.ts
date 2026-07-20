import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    config();

    const frontendOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:5173')
        .split(',')
        .map((origin) => origin.trim());

    app.enableCors({
        origin: frontendOrigins,
        credentials: true,
    });
    app.setGlobalPrefix('api');

    await app.listen(Number(process.env.PORT ?? 3000));
}

bootstrap();
