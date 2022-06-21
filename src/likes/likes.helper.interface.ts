import { ClientSession } from "mongoose";
import { Like } from "./likes.schema";

export interface ILikesHelper {
    createLike(userId: string, postId: string, session: ClientSession);

    getLike(userId: string, postId: string): Promise<Like>;

    isLikeExists(userId: string, postId: string): Promise<boolean>;

    deleteLike(likeId:string): Promise<void>;

    deleteLikes(postId:string): Promise<void>;
}

export const ILikesHelper = Symbol("ILikesHelper");