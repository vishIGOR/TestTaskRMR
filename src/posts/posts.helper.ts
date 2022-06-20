import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { IPostsHelper } from "./posts.helper.interface";
import { Post } from "./posts.schema";
import { GetPostDetailedDataDto, GetPostDto } from "./posts.dtos";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
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
            post = this._postModel.findById(id);
        } catch (error) {
            return this._errorsHelper.returnNullWhenCaughtCastError(error);
        }
        return await post;
    }

    async deletePostById(id: string): Promise<void> {
        try {
            await this._postModel.findByIdAndDelete(id);
        } catch (error) {
            this._errorsHelper.throwInvalidIdExceptionWhenCaughtCastError(error);
        }
    }

    async getNewestPosts(limit: number | null = null, skip: number | null = 0): Promise<Post[]> {
        let posts;
        try {
            if (limit !== null) {
                posts = this._postModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
            } else {
                posts = this._postModel.find().sort({ createdAt: -1 }).skip(skip);
            }
        } catch (error) {
            throw new InternalServerErrorException("Unexpected database error");
        }

        return await posts;
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
}