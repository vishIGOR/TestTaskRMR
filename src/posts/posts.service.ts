import {
    ForbiddenException,
    Inject,
    Injectable,
    InternalServerErrorException, NotFoundException
} from "@nestjs/common";
import { IPostsService } from "./posts.service.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Post, SitePreview } from "./posts.schema";
import { ClientSession, Model, Schema } from "mongoose";
import {
    CreatePostDto,
    GetPostDetailedDataDto,
    GetPostDto,
    GetPostsDataWithPaginationDto,
    PagesData
} from "./posts.dtos";
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
            throw new InternalServerErrorException("Unexpected database error");
        }

        return this._postsHelper.getPostDetailedDataDtoFromModel(post);
    }

    async deletePost(userId: string, postId: string): Promise<void> {
        let post = await this._postsHelper.getPostById(postId);
        if (!post) {
            throw new NotFoundException("Post with this id doesn't exist");
        }
        if (post.authorId.toString() !== userId) {
            throw new ForbiddenException("Authorized user isn't an author of this post");
        }

        await this._postsHelper.deletePostById(postId);

        let promises = [];

        let fileNames = post.fileNames;
        for (const fileName of fileNames) {
            promises.push(this._filesService.deleteFile(fileName));
        }

        promises.push(this._likesHelper.deleteLikes(postId));

        await Promise.all(promises);
    }

    async getPosts(userId: string, limit: number = null, skip: number = 0): Promise<GetPostsDataWithPaginationDto> {
        if (!skip)
            skip = 0;

        let pagesData = new PagesData();
        let postsWithPagination = new GetPostsDataWithPaginationDto();

        let likesPromises = [];
        let posts: Post[] = await this._postsHelper.getNewestPosts(limit, skip);
        let postDtos: GetPostDto[] = [];
        for (const post of posts) {
            let currentPostDto = this._postsHelper.getPostDtoFromModel(post);
            likesPromises.push(this._likesHelper.isLikeExists(userId, post._id));
            postDtos.push(currentPostDto);
        }

        if (limit) {
            let numberOfPosts = await this._postsHelper.getNumberOfPosts();
            pagesData.currentPage = Math.floor(skip / limit) + 1;
            pagesData.totalNumberOfPages = Math.floor(numberOfPosts / limit);
            pagesData.nextSkip = limit + skip < numberOfPosts ? limit + skip : null;
        }

        postsWithPagination.pagesData = pagesData;
        postsWithPagination.posts = postDtos;

        let likes = await Promise.all(likesPromises);
        for (let i = 0; i < likes.length; i++) {
            postsWithPagination.posts[i].isLikedByCurrentUser = likes[i];
        }

        return postsWithPagination;
    }

    async getPostDetailedData(userId: string, postId: string): Promise<GetPostDetailedDataDto> {
        let post = await this._postsHelper.getPostById(postId);

        if (!post) {
            throw new NotFoundException("Post with this id doesn't exists");
        }

        let isLiked = this._likesHelper.isLikeExists(userId, post._id);

        let postDto = this._postsHelper.getPostDetailedDataDtoFromModel(post);
        postDto.isLikedByCurrentUser = await isLiked;

        return postDto;
    }

    async likePost(userId: string, postId: string, session: ClientSession): Promise<void> {
        let post = await this._postsHelper.getPostById(postId);
        if (!post) {
            throw new NotFoundException("Post with this id doesn't exists");
        }

        let like = this._likesHelper.getLike(userId, postId);
        let promises = [];
        if ((await like)) {
            promises.push(this._likesHelper.deleteLike((await like)._id));
            promises.push(this._postsHelper.decrementLikes(postId));
        } else {
            promises.push(this._likesHelper.createLike(userId, postId, session));
            promises.push(this._postsHelper.incrementLikes(postId));
        }

        await Promise.all(promises);
    }
}
