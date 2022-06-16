import { Post } from "../schemas/posts.schema";
import { GetPostDetailedDataDto, GetPostDto } from "./posts.dtos";


export interface IPostsHelper{
    getNewestPosts(limit: number | null, from: number | null):Promise<Post[]>
    getPostById(id: string):Promise<Post>
    deletePostById(id:string):Promise<void>
    getPostDtoFromModel(post: Post): GetPostDto
    getPostDetailedDataDtoFromModel(post: Post): GetPostDetailedDataDto
}
export const IPostsHelper = Symbol("IPostsHelper");