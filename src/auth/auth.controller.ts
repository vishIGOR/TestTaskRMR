import { Body, Controller, HttpException, HttpStatus, Inject, Post, Res } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { LoginUserDto, RegisterUserDto } from "../users/users.dtos";
import { Response } from "express";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RefreshTokenDto, TokenPairDto } from "./tokens/tokens.dtos";
import { IAuthService } from "./auth.service.interface";

@Controller("auth")
@ApiTags("Auth")
export class AuthController {
    constructor(@InjectConnection() private readonly _mongoConnection: Connection, @Inject(IAuthService) private readonly _authService: IAuthService) {
    }

    @Post("/register")
    @ApiOperation({
        summary: "Register new user."
    })
    @ApiResponse({
        status: 201,
        description: "The user was created successfully",
        type: TokenPairDto
    })
    @ApiResponse({ status: 400, description: "Some validation error" })
    @ApiResponse({ status: 500, description: "Unexpected server error" })
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
    @ApiOperation({
        summary: "Login user."
    })
    @ApiResponse({
        status: 200,
        description: "The login was successful",
        type: TokenPairDto
    })
    @ApiResponse({ status: 400, description: "Some validation error" })
    @ApiResponse({ status: 404, description: "Some data was not found" })
    @ApiResponse({ status: 500, description: "Unexpected server error" })
    async login(@Body() userDto: LoginUserDto, @Res() res: Response) {
        const session = await this._mongoConnection.startSession();

        try {
            let tokenPair: TokenPairDto = await this._authService.loginUser(userDto, session);
            return res.status(HttpStatus.OK).send(tokenPair);
        } catch (error) {
            if (error instanceof HttpException)
                throw error;
            throw new HttpException("Unexpected server error", HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            await session.endSession();
        }
    }

    @Post("/refresh")
    @ApiOperation({
        summary: "Refresh tokens",
        description: "After some time access tokens will be expired and you can refresh the pair of tokens using refresh token."
    })
    @ApiResponse({
        status: 200,
        description: "Tokens were refreshed successfully",
        type: TokenPairDto
    })
    @ApiResponse({ status: 400, description: "Some validation error" })
    @ApiResponse({ status: 404, description: "Token was not found" })
    @ApiResponse({ status: 500, description: "Unexpected server error" })
    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto, @Res() res: Response) {
        const session = await this._mongoConnection.startSession();

        try {
            let tokenPair: TokenPairDto = await this._authService.refreshToken(refreshTokenDto, session);
            return res.status(HttpStatus.OK).send(tokenPair);
        } catch (error) {
            if (error instanceof HttpException)
                throw error;
            throw new HttpException("Unexpected server error", HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            await session.endSession();
        }
    }
}
