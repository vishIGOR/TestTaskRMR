import {
    BadRequestException,
    ForbiddenException,
    Inject,
    Injectable,
    InternalServerErrorException
} from "@nestjs/common";
import { IPostsService } from "./posts.service.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Post, SitePreview } from "../schemas/posts.schema";
import { ClientSession, Model, Schema } from "mongoose";
import { CreatePostDto, GetPostDetailedDataDto, GetPostDto } from "./posts.dtos";
import { Express } from "express";
import { IFilesService } from "../files/files.service.interface";
import { IPostsHelper } from "./posts.helper.interface";
import { ILikesHelper } from "../likes/likes.helper.interface";
import { IWebscrapingHelper } from "../webscraping/webscraping.helper.interface";

@Injectable()
export class PostsService implements IPostsService {
    constructor(@InjectModel(Post.name) private readonly _postModel: Model<Post>,
                @Inject(IFilesService) private readonly _filesService: IFilesService,
                @Inject(ILikesHelper) private readonly _likesHelper: ILikesHelper,
                @Inject(IPostsHelper) private readonly _postsHelper: IPostsHelper,
                @Inject(IWebscrapingHelper) private readonly _webscrapingHelper: IWebscrapingHelper) {
    }

    async createPost(authorId: string, createPostDto: CreatePostDto, files, session: ClientSession): Promise<GetPostDetailedDataDto> {
        let fileNames = await this._filesService.createFiles(files);

        let listOfLinks = this._webscrapingHelper.getAllLinksFromText(createPostDto.message);
        let listOfPreviews = [];
        for (let link of listOfLinks) {
            let currentData = await this._webscrapingHelper.getAllHeadData(link);
            let currentPreview = new SitePreview();

            if (currentData.previewData.title) {
                currentPreview.title = currentData.previewData.title;
            } else {
                if (currentData.metaData.title) {
                    currentPreview.title = currentData.metaData.title;
                } else {
                    continue;
                }
            }

            if (currentData.previewData.description) {
                currentPreview.description = currentData.previewData.description;
            } else {
                if (currentData.metaData.description) {
                    currentPreview.description = currentData.metaData.description;
                } else {
                    continue;
                }

            }

            if (currentData.previewData.image) {
                currentPreview.image = currentData.previewData.image;
            } else {
                currentPreview.image = null;
            }
            currentPreview.url = currentData.previewData.url;

            listOfPreviews.push(currentPreview);
        }

        let post = new this._postModel({
            message: createPostDto.message,
            fileNames: fileNames,
            authorId: authorId,
            sitePreviews: listOfPreviews
        });

        try {
            post = await post.save({ session });
        } catch (error) {
            throw new InternalServerErrorException(error);
        }

        return this._postsHelper.getPostDetailedDataDtoFromModel(post);
    }

    async deletePost(userId: string, postId: string): Promise<void> {
        let post = await this._postsHelper.getPostById(postId);
        if (!post) {
            throw new BadRequestException("Post with this id doesn't exist");
        }
        if (post.authorId.toString() !== userId) {
            throw new ForbiddenException("Authorized user isn't an author of this post");
        }
        try {
            let fileNames = post.fileNames;
            await this._postModel.findByIdAndDelete(postId);
            for (const fileName of fileNames) {
                await this._filesService.deleteFile(fileName);
            }
        } catch (error) {
            throw new InternalServerErrorException(error);
        }

    }

    async getPosts(userId: string, limit: number | null = null, from: number | null = 0): Promise<GetPostDto[]> {
        let posts: Post[] = await this._postsHelper.getNewestPosts(limit, from);
        let postDtos: GetPostDto[] = [];
        for (const post of posts) {
            let currentPostDto = this._postsHelper.getPostDtoFromModel(post);
            if (await this._likesHelper.isLikeExists(userId, post._id))
                currentPostDto.isLikedByCurrentUser = true;
            postDtos.push(currentPostDto);
        }
        return postDtos;
    }

    async getPostDetailedData(userId: string, postId: string): Promise<GetPostDetailedDataDto> {
        let post = await this._postsHelper.getPostById(postId);

        if (!post) {
            throw new BadRequestException("Post with this id doesn't exists");
        }

        let postDto = this._postsHelper.getPostDetailedDataDtoFromModel(post);
        if (await this._likesHelper.isLikeExists(userId, post._id))
            postDto.isLikedByCurrentUser = true;
        return postDto;
    }

    async likePost(userId: string, postId: string, session: ClientSession): Promise<void> {
        let post = await this._postsHelper.getPostById(postId);
        if (!post) {
            throw new BadRequestException("Post with this id doesn't exists");
        }

        let like = await this._likesHelper.getLike(userId, postId);
        if (like) {
            await this._likesHelper.deleteLike(like);
            return;
        }
        await this._likesHelper.createLike(userId, postId, session);

    }
}
