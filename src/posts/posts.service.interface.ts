import { CreatePostDto, GetPostDetailedDataDto, GetPostDto, GetPostsDataWithPaginationDto } from "./posts.dtos";
import { ClientSession } from "mongoose";

export interface IPostsService {
    createPost(authorId: string, createPostDto: CreatePostDto, files, session: ClientSession): Promise<GetPostDetailedDataDto>;

    deletePost(userId: string, postId: string): Promise<void>;

    getPosts(userId: string, limit: number | null, skip: number | null): Promise<GetPostsDataWithPaginationDto>;

    getPostDetailedData(userId: string, postId: string): Promise<GetPostDetailedDataDto>;

    likePost(userId: string, postId: string, session:ClientSession): Promise<void>;
}

export const IPostsService = Symbol("IPostsService");