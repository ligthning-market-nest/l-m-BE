import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { unlink } from 'fs/promises';
import { Observable, catchError, throwError } from 'rxjs';

type UploadedFile = {
    path: string;
};

type FileUploadRequest = {
    files?: UploadedFile[];
};

@Injectable()
export class UploadedFilesCleanupInterceptor implements NestInterceptor {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<unknown> {
        const request = context.switchToHttp().getRequest<FileUploadRequest>();

        return next.handle().pipe(
            catchError((error: unknown) => {
                const files = request.files ?? [];

                void Promise.allSettled(
                    files.map((file) => unlink(file.path)),
                );

                return throwError(() => error);
            }),
        );
    }
}
