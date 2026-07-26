import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from './entities/follow.entity';
import { Member } from './entities/member.entity';
import { MemberController } from './member.controller';
import { MemberRepository } from './member.repository';
import { MemberService } from './member.service';

@Module({
    imports: [TypeOrmModule.forFeature([Member, Follow])],
    controllers: [MemberController],
    providers: [MemberRepository, MemberService],
    exports: [MemberRepository, MemberService],
})
export class MemberModule {}
