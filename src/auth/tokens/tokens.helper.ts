import { ITokensHelper } from "./tokens.helper.interface";
import { Injectable } from "@nestjs/common";
import { randomBytes } from "crypto";
import { User } from "../../schemas/users.schema";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class TokensHelper implements ITokensHelper {
    constructor(
        private _jwtService: JwtService) {
    }

    generateRefreshToken(): string {
        return randomBytes(64).toString("hex");
    }

    async generateAccessToken(user: User): Promise<string> {
        const payload = { id: user._id, username: user.username };
        return this._jwtService.sign(payload, {
            secret: process.env.PRIVATE_KEY,
            privateKey: process.env.PRIVATE_KEY,
            expiresIn: process.env.ACCESS_TOKEN_LIFE_IN_MINUTES
        });
    }
}