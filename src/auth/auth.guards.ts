import {
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
    UnauthorizedException
} from "@nestjs/common";
import { Observable } from "rxjs";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "../auth/tokens/tokens.dtos";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private _jwtService: JwtService) {
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const req = context.switchToHttp().getRequest();
        try {
            const authHeader = req.headers.authorization;
            const type = authHeader.split(" ")[0];
            const token = authHeader.split(" ")[1];

            if (type !== "Bearer" || !token) {
                throw new UnauthorizedException({ message: "User is not authorized" });
            }

            const user = this._jwtService.verify(token, { secret: process.env.PRIVATE_KEY });

            return true;
        } catch (error) {
            throw new UnauthorizedException({ message: "User is not authorized" });
        }
    }

}

@Injectable()
export class GetIdFromAuthGuard implements CanActivate {
    constructor(private _jwtService: JwtService) {
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const req = context.switchToHttp().getRequest();
        try {
            let authHeader;
            let bearer;
            let token;
            try {
                authHeader = req.headers.authorization;
                bearer = authHeader.split(" ")[0];
                token = authHeader.split(" ")[1];
            } catch {
                req.userId = null;
                return true;
            }

            if (bearer !== "Bearer" || !token) {
                req.userId = null;
                return true;
            }

            let userPayload = this._jwtService.decode(token) as JwtPayload;
            req.userId = userPayload.id;

            return true;
        } catch (error) {
            throw new HttpException("Unexpected authguard error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}