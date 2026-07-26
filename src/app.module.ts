import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { typeOrmAsyncOptions } from './config/typeorm.config';
import { ItemModule } from './Items/item.module';
import { TradeModule } from './trades/trade.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env'],
        }),
        TypeOrmModule.forRootAsync(typeOrmAsyncOptions),
        AuthModule,
        ItemModule,
        TradeModule,
        ChatModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
