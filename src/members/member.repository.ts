import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Member } from './entities/member.entity';

@Injectable()
export class MemberRepository {
    constructor(
        @InjectRepository(Member)
        private readonly repository: Repository<Member>,
    ) {}

    findById(id: number): Promise<Member | null> {
        return this.repository.findOne({ where: { id } });
    }

    findByEmail(email: string): Promise<Member | null> {
        return this.repository.findOne({ where: { email } });
    }

    findByGoogleId(googleId: string): Promise<Member | null> {
        return this.repository.findOne({ where: { googleId } });
    }

    findByNickname(nickname: string): Promise<Member | null> {
        return this.repository.findOne({ where: { nickname } });
    }

    create(member: DeepPartial<Member>): Member {
        return this.repository.create(member);
    }

    save(member: DeepPartial<Member>): Promise<Member> {
        return this.repository.save(member);
    }
}
