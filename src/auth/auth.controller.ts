import { Body, Controller, HttpException, HttpStatus, Inject, Post, Res } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { LoginUserDto, RegisterUserDto } from "../users/users.dtos";
import { Response } from "express";
import { ApiTags } from "@nestjs/swagger";
import { RefreshTokenDto, TokenPairDto } from "./tokens/tokens.dtos";
import { IAuthService } from "./auth.service.interface";

@ApiTags("Аутентификация")
@Controller("auth")
export class AuthController {
    constructor(@InjectConnection() private readonly _mongoConnection: Connection, @Inject(IAuthService) private readonly _authService: IAuthService) {
    }

    @Post("/register")
    async register(@Body() userDto: RegisterUserDto, @Res() res: Response) {
        const session = await this._mongoConnection.startSession();
        // session.startTransaction();
        try {
            let tokenPair: TokenPairDto = await this._authService.registerUser(userDto, session);
            // await session.commitTransaction();
            return res.status(HttpStatus.CREATED).send(tokenPair);
        } catch (error) {
            // await session.abortTransaction();
            if (error instanceof HttpException)
                throw error;
            throw new HttpException("Unexpected server error", HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            await session.endSession();
        }
    }

    @Post("/login")
    async login(@Body() userDto: LoginUserDto, @Res() res: Response) {
        const session = await this._mongoConnection.startSession();

        try {
            let tokenPair: TokenPairDto = await this._authService.loginUser(userDto, session);
            return res.status(HttpStatus.CREATED).send(tokenPair);
        } catch (error) {
            if (error instanceof HttpException)
                throw error;
            throw new HttpException("Unexpected server error", HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            await session.endSession();
        }
    }

    @Post("/refresh")
    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto, @Res() res: Response) {
        const session = await this._mongoConnection.startSession();

        try {
            let tokenPair: TokenPairDto = await this._authService.refreshToken(refreshTokenDto, session);
            return res.status(HttpStatus.CREATED).send(tokenPair);
        } catch (error) {
            if (error instanceof HttpException)
                throw error;
            throw new HttpException("Unexpected server error", HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            await session.endSession();
        }
    }
}
