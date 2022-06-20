import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { ILikesHelper } from "./likes.helper.interface";
import { InjectModel } from "@nestjs/mongoose";
import { ClientSession, Model, Error } from "mongoose";
import { Like } from "./likes.schema";
import { IErrorsHelper } from "../errors/errors.helper.interface";


@Injectable()
export class LikesHelper implements ILikesHelper {
    constructor(@InjectModel(Like.name) private readonly _likeModel: Model<Like>,
                @Inject(IErrorsHelper) private readonly _errorsHelper: IErrorsHelper) {
    }

    async getLike(userId: string, postId: string): Promise<Like> {
        let like;
        try {
            like = this._likeModel.findOne({ userId: userId, postId: postId });
        } catch (error) {
            return this._errorsHelper.returnNullWhenCaughtCastError(error);
        }
        return await like;
    }

    async isLikeExists(userId: string, postId: string): Promise<boolean> {
        let like;
        try {
            like = await this._likeModel.findOne({ userId: userId, postId: postId });
            if (like)
                return true;
        } catch (error) {
            return this._errorsHelper.returnFalseWhenCaughtCastError(error);
        }
        return false;
    }

    async deleteLike(likeId: string): Promise<void> {
        try {
            await this._likeModel.findByIdAndDelete(likeId);
        } catch (error) {
            this._errorsHelper.throwInvalidIdExceptionWhenCaughtCastError(error);
        }
    }

    async createLike(userId: string, postId: string, session: ClientSession) {
        let like = new this._likeModel({
            userId: userId,
            postId: postId
        });

        try {
            like = await like.save({ session });
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async deleteLikes(postId: string): Promise<void> {
        await this._likeModel.deleteMany({ postId: postId });
    }
}