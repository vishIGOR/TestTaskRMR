import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { ITokensHelper } from "./tokens/tokens.helper.interface";
import { TokensHelper } from "./tokens/tokens.helper";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../schemas/users.schema";
import { JwtModule } from "@nestjs/jwt";
import { GetIdFromAuthGuard, JwtAuthGuard } from "./auth.guards";
import { IAuthService } from "./auth.service.interface";
import { UsersModule } from "../users/users.module";

@Module({
    providers: [
        {
            provide: ITokensHelper,
            useClass: TokensHelper
        },
        {
            provide: IAuthService,
            useClass: AuthService
        },
        AuthService,
        JwtAuthGuard,
        GetIdFromAuthGuard
    ],
    controllers: [AuthController],
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema }
        ]),
        JwtModule.register({
            secret: process.env.PRIVATE_KEY || "secret",
            signOptions: {
                expiresIn: process.env.ACCESS_TOKEN_LIFE_IN_MINUTES || "30m"
            }
        }),
        UsersModule
    ],
    exports: [
        JwtAuthGuard,
        GetIdFromAuthGuard
    ]

})
export class AuthModule {
}
