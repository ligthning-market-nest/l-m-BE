import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { MemberRepository } from './member.repository';
import { MemberService } from './member.service';

@Module({
    imports: [TypeOrmModule.forFeature([Member])],
    providers: [MemberRepository, MemberService],
    exports: [MemberRepository, MemberService],
})
export class MemberModule {}
