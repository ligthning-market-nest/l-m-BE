import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';


//jwt를 컨트롤러 코드에서 사용할 수 있게 해줌
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
