import { IUsersHelper } from "./users.helper.interface";
import { User } from "../schemas/users.schema";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { pbkdf2Sync, randomBytes } from "crypto";

@Injectable()
export class UsersHelper implements IUsersHelper {
    constructor(@InjectModel(User.name) private readonly _userModel: Model<User>) {
    }

    async getUserById(id: string): Promise<User> {
        let user;
        try {
            user = await this._userModel.findById(id).exec();
        } catch (error) {
            throw new InternalServerErrorException(error);
        }

        return user;
    }

    async getUserByEmail(email: string): Promise<User> {
        let user;
        try {
            user = await this._userModel.findOne({ "email": email }).exec();
        } catch (error) {
            throw new InternalServerErrorException(error);
        }

        return user;
    }

    async getUserByUsername(username: string): Promise<User> {
        let user;
        try {
            user = await this._userModel.findOne({ "username": username }).exec();
        } catch (error) {
            throw new InternalServerErrorException(error);
        }

        return user;
    }

    async getUserByRefreshToken(token: string): Promise<User> {
        let user;
        try {
            user = await this._userModel.findOne({ "refreshToken": token }).exec();
        } catch (error) {
            throw new InternalServerErrorException(error);
        }

        return user;
    }


    setPassword(user: User, password: string): void {
        user.salt = randomBytes(16).toString("hex");
        user.password = pbkdf2Sync(password, user.salt, 100, 512, "sha512").toString("hex");
    };

    isPasswordValid(user: User, password: string): boolean {
        var hash = pbkdf2Sync(password, user.salt, 100, 512, "sha512").toString("hex");
        return user.password === hash;
    };
}