import { catchError, Observable, throwError } from "rxjs";
import {
    CallHandler,
    ExecutionContext, HttpException,
    Injectable,
    InternalServerErrorException,
    NestInterceptor
} from "@nestjs/common";

@Injectable()
export class ServerErrorsInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next
            .handle()
            .pipe(
                catchError(error => throwError(() => {
                    if (error instanceof HttpException)
                        return error;

                    return new InternalServerErrorException("Unexpected server error");
                }))
            );
    }
}
