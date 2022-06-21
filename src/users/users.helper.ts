import { IUsersHelper } from "./users.helper.interface";
import { User } from "./users.schema";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { pbkdf2Sync, randomBytes } from "crypto";
import { UnexpectedDatabaseError } from "../errors/errors.helper";

@Injectable()
export class UsersHelper implements IUsersHelper {
    constructor(@InjectModel(User.name) private readonly _userModel: Model<User>) {
    }

    async getUserById(id: string): Promise<User> {
        let user;
        try {
            user = this._userModel.findById(id).exec();
            return await user;
        } catch (error) {
            throw new UnexpectedDatabaseError();
        }
    }

    async getUserByEmail(email: string): Promise<User> {
        let user;
        try {
            user = this._userModel.findOne({ "email": email }).exec();
            return await user;
        } catch (error) {
            throw new UnexpectedDatabaseError();
        }
    }

    async getUserByUsername(username: string): Promise<User> {
        let user;
        try {
            user = this._userModel.findOne({ "username": username }).exec();
            return await user;
        } catch (error) {
            throw new UnexpectedDatabaseError();
        }
    }

    async getUserByRefreshToken(token: string): Promise<User> {
        let user;
        try {
            user = this._userModel.findOne({ "refreshToken": token }).exec();
            return await user;
        } catch (error) {
            throw new UnexpectedDatabaseError();
        }
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