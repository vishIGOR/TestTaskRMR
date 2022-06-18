import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { IPostsHelper } from "./posts.helper.interface";
import { Post } from "../schemas/posts.schema";
import { GetPostDetailedDataDto, GetPostDto } from "./posts.dtos";
import { InjectModel } from "@nestjs/mongoose";
import { Error, Model } from "mongoose";
import { IErrorsHelper } from "../errors/errors.helper.interface";
import { SitePreviewDataDto } from "../webscraping/webscraping.dtos";


@Injectable()
export class PostsHelper implements IPostsHelper {
    constructor(@InjectModel(Post.name) private readonly _postModel: Model<Post>,
                @Inject(IErrorsHelper) private readonly _errorsHelper: IErrorsHelper) {
    }

    async getPostById(id: string): Promise<Post> {
        let post;
        try {
            post = await this._postModel.findById(id);
        } catch (error) {
            return this._errorsHelper.returnNullWhenCaughtCastError(error);
        }
        return post;
    }

    getPostDetailedDataDtoFromModel(post: Post): GetPostDetailedDataDto {
        let dto = new GetPostDetailedDataDto();
        dto.id = post._id;
        dto.message = post.message;
        dto.authorId = post.authorId.toString();
        dto.fileNames = post.fileNames;
        dto.likes = post.likes;
        dto.createdAt = post.createdAt;

        let previews = [];
        for (let preview of post.sitePreviews) {
            let currentPreviewDto = new SitePreviewDataDto();
            currentPreviewDto.url = preview.url;
            currentPreviewDto.title = preview.title;
            currentPreviewDto.image = preview.image;
            currentPreviewDto.description = preview.description;

            previews.push(currentPreviewDto);
        }
        dto.previews = previews;

        return dto;
    }

    getPostDtoFromModel(post: Post): GetPostDto {
        let dto = new GetPostDto();
        dto.id = post._id;
        dto.message = post.message;
        dto.fileNames = post.fileNames;
        dto.likes = post.likes;
        return dto;
    }

    deletePostById(id: string): Promise<void> {
        return Promise.resolve(undefined);
    }

    async getNewestPosts(limit: number | null = null, from: number | null = 0): Promise<Post[]> {
        let posts;
        try {
            if (limit !== null) {
                posts = await this._postModel.find().sort({ createdAt: -1 }).skip(from).limit(limit);
            } else {
                posts = await this._postModel.find().sort({ createdAt: -1 }).skip(from);
            }
        } catch (error) {
            throw new InternalServerErrorException(error);
        }

        return posts;
    }

    async decrementLikes(id: string): Promise<void> {
        let post = this.getPostById(id);
        try {
            await this._postModel.findOneAndUpdate({ _id: id }, { likes: (await post).likes - 1 });
        } catch (error) {
            this._errorsHelper.throwInvalidIdExceptionWhenCaughtCastError(error);
        }

    }

    async incrementLikes(id: string): Promise<void> {
        let post = this.getPostById(id);
        try {
            await this._postModel.findOneAndUpdate({ _id: id }, { likes: (await post).likes + 1 });
        } catch (error) {
            this._errorsHelper.throwInvalidIdExceptionWhenCaughtCastError(error);
        }
    }

    async getNumberOfPosts(): Promise<number> {
        return this._postModel.count();
    }
}