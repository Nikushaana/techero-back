import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class TokenValidationGuard extends AuthGuard("jwt") {
    // keep canActivate as is
    canActivate(context: ExecutionContext) {
        return super.canActivate(context);
    }

    // override handleRequest to customize error messages
    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const token = request.cookies?.accessToken;

        // 1️⃣ No token at all
        if (!token) {
            throw new UnauthorizedException("Token missing");
        }

        // 2️⃣ Expired token
        if (info?.name === "TokenExpiredError") {
            throw new UnauthorizedException("Token expired");
        }

        // 3️⃣ Invalid token or signature
        if (err || !user) {
            throw new UnauthorizedException("Invalid token");
        }

        // ✅ token is valid
        return user;
    }
}