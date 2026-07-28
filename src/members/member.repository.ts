import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';
import { Member } from './entities/member.entity';

@Injectable()
export class MemberRepository {
    constructor(
        @InjectRepository(Member)
        private readonly repository: Repository<Member>,
        @InjectRepository(Follow)
        private readonly followRepository: Repository<Follow>,
    ) {}

    findById(id: number): Promise<Member | null> {
        return this.repository.findOne({ where: { id } });
    }


    findByEmail(email: string): Promise<Member | null> {
        return this.repository.findOne({ where: { email } });
    }


    //구글
    findByGoogleId(googleId: string): Promise<Member | null> {
        return this.repository.findOne({ where: { googleId } });
    }


    //애플
    findByAppleId(appleId: string): Promise<Member | null> {
        return this.repository.findOne({ where: { appleId } });
    }

    //카카오
    findByKakaoId(kakaoId: string): Promise<Member | null> {
        return this.repository.findOne({ where: { kakaoId } });
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




    findFollow(followerId: number, followingId: number): Promise<Follow | null> {
        return this.followRepository.findOne({
            where: { followerId, followingId },
        });
    }




    createFollow(follower: Member, following: Member): Promise<Follow> {
        return this.followRepository.save(
            this.followRepository.create({
                followerId: follower.id,
                follower,
                followingId: following.id,
                following,
            }),
        );
    }



    removeFollow(follow: Follow): Promise<Follow> {
        return this.followRepository.remove(follow);
    }



    countFollowers(memberId: number): Promise<number> {
        return this.followRepository.count({ where: { followingId: memberId } });
    }



    countFollowing(memberId: number): Promise<number> {
        return this.followRepository.count({ where: { followerId: memberId } });
    }
}
