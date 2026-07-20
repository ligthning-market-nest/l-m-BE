import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const typeOrmAsyncOptions: TypeOrmModuleAsyncOptions = {
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('MYSQL_HOST', '127.0.0.1'),
        port: Number(configService.get<string>('MYSQL_PORT', '3306')),
        username: configService.get<string>('MYSQL_USERNAME', 'root'),
        password: configService.get<string>('MYSQL_PASSWORD', ''),
        database: configService.get<string>('MYSQL_DATABASE', 'lightning_market'),
        autoLoadEntities: true,
        synchronize: true,
        logging: false,
        retryAttempts: 3,
        retryDelay: 3000,
    }),
};
