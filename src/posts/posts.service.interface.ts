import { CreatePostDto, GetPostDetailedDataDto, GetPostDto } from "./posts.dtos";
import { ClientSession, Schema } from "mongoose";

export interface IPostsService {
    createPost(authorId: string, createPostDto: CreatePostDto, files, session: ClientSession): Promise<GetPostDetailedDataDto>;

    deletePost(userId: string, postId: string): Promise<void>;

    getPosts(userId: string, limit: number | null, from: number | null): Promise<GetPostDto[]>;

    getPostDetailedData(userId: string, postId: string): Promise<GetPostDetailedDataDto>;

    likePost(userId: string, postId: string, session:ClientSession): Promise<void>;
}

export const IPostsService = Symbol("IPostsService");