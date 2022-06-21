import {
    BadRequestException,
    ConflictException,
    Inject,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "../users/users.schema";
import { ClientSession, Model } from "mongoose";
import { LoginUserDto, RegisterUserDto } from "../users/users.dtos";
import { IAuthService } from "./auth.service.interface";
import { RefreshTokenDto, TokenPairDto } from "./tokens/tokens.dtos";
import { IUsersHelper } from "../users/users.helper.interface";
import { ITokensHelper } from "./tokens/tokens.helper.interface";
import { UnexpectedDatabaseError } from "../errors/errors.helper";

@Injectable()
export class AuthService implements IAuthService{
    constructor(
        @InjectModel(User.name) private readonly _userModel: Model<User>,
        @Inject(IUsersHelper) private readonly _usersHelper: IUsersHelper,
        @Inject(ITokensHelper) private readonly _tokensHelper: ITokensHelper
        ) {
    }

    async loginUser(userDto: LoginUserDto, session: ClientSession): Promise<TokenPairDto> {
        let user = await this._usersHelper.getUserByEmail(userDto.email);
        if (!user) {
            throw new NotFoundException("Password or login is incorrect");
        }

        if (!this._usersHelper.isPasswordValid(user, userDto.password)) {
            throw new NotFoundException("Password or login is incorrect");
        }

        return await this.generateTokenPair(user);
    }

    async refreshToken(refreshTokenDto: RefreshTokenDto, session: ClientSession): Promise<TokenPairDto> {
        let user = await this._usersHelper.getUserByRefreshToken(refreshTokenDto.refreshToken);

        if (!user) {
            throw new NotFoundException("Token is incorrect");
        }

        return await this.generateTokenPair(user);
    }

    async registerUser(userDto: RegisterUserDto, session: ClientSession): Promise<TokenPairDto> {
        let user = await this._usersHelper.getUserByEmail(userDto.email);
        if (user) {
            throw new BadRequestException("User already exists");
        }

        user = await this._usersHelper.getUserByUsername(userDto.username);
        if (user) {
            throw new BadRequestException("User already exists");
        }

        user = new this._userModel({
            username: userDto.username,
            email: userDto.email,
            birthDate: userDto.birthDate
        });
        this._usersHelper.setPassword(user, userDto.password);
        try {
            user = await user.save({ session });
        } catch (error) {
            throw new UnexpectedDatabaseError();
        }

        return await this.generateTokenPair(user);
    }

    private async generateTokenPair(user: User): Promise<TokenPairDto> {
        let tokenPair: TokenPairDto = new TokenPairDto();

        try {
            user = await this._userModel.findByIdAndUpdate({ _id: user._id }, { refreshToken: this._tokensHelper.generateRefreshToken() }, { new: true });
        } catch (error) {
            throw new UnexpectedDatabaseError();
        }

        tokenPair.refreshToken = user.refreshToken;
        tokenPair.accessToken = await this._tokensHelper.generateAccessToken(user);

        return tokenPair;
    }
}
