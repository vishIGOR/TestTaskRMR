import { ClientSession } from "mongoose";
import { Like } from "../schemas/likes.schema";

export interface ILikesHelper {
    createLike(userId: string, postId: string, session: ClientSession);

    getLike(userId: string, postId: string): Promise<Like>;

    isLikeExists(userId: string, postId: string): Promise<boolean>;

    deleteLike(like: Like): Promise<void>;
}

export const ILikesHelper = Symbol("ILikesHelper");