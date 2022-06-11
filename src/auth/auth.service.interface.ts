import { ClientSession } from "mongoose";
import { LoginUserDto, RegisterUserDto } from "../users/users.dtos";
import { RefreshTokenDto, TokenPairDto } from "./tokens/tokens.dtos";

export interface IAuthService {
    registerUser(userDto: RegisterUserDto, session: ClientSession): Promise<TokenPairDto>,

    loginUser(userDto: LoginUserDto, session: ClientSession): Promise<TokenPairDto>,

    refreshToken(refreshTokenDto: RefreshTokenDto, session: ClientSession): Promise<TokenPairDto>,
}

export const IAuthService = Symbol("IAuthService");