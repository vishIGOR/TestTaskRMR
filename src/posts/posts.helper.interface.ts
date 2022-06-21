import { Post } from "./posts.schema";
import { GetPostDetailedDataDto, GetPostDto } from "./posts.dtos";


export interface IPostsHelper {
    getNewestPosts(limit: number | null, skip: number | null): Promise<Post[]>;

    getPostById(id: string): Promise<Post>;

    deletePostById(id: string): Promise<void>;

    getPostDtoFromModel(post: Post): GetPostDto;

    getPostDetailedDataDtoFromModel(post: Post): GetPostDetailedDataDto;

    incrementLikes(id: string): Promise<void>;

    decrementLikes(id: string): Promise<void>;

    getNumberOfPosts(): Promise<number>;
}

export const IPostsHelper = Symbol("IPostsHelper");