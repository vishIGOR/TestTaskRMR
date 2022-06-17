import {
    Body,
    Controller,
    Delete,
    Get, HttpException, HttpStatus,
    Inject,
    Param,
    Request,
    Post as HttpPost, Res,
    UploadedFiles, UseGuards,
    UseInterceptors, Put, Query
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection, Schema as MongooseSchema } from "mongoose";
import { IPostsService } from "./posts.service.interface";
import { CreatePostDto } from "./posts.dtos";
import { Response } from "express";
import { GetIdFromAuthGuard, JwtAuthGuard } from "../auth/auth.guards";
import { ApiPostFiles } from "../files/files.decorators";
import parser from "html-metadata-parser";
import { FilesInterceptor } from "@nestjs/platform-express";

@ApiTags("Записи")
@Controller("posts")
export class PostsController {
    constructor(@InjectConnection() private readonly _mongoConnection: Connection, @Inject(IPostsService) private readonly _postsService: IPostsService) {
    }

    @UseGuards(GetIdFromAuthGuard)
    @Get("/")
    async getPosts(@Request() req, @Query("limit") limit: number, @Query("from") from: number, @Res() res: Response) {
        const session = await this._mongoConnection.startSession();
        try {
            let postDtos = await this._postsService.getPosts(req.userId, limit, from);
            return res.status(HttpStatus.OK).send(postDtos);
        } catch (error) {
            if (error instanceof HttpException)
                throw error;
            throw new HttpException("Unexpected server error", HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            await session.endSession();
        }
    }

    @UseGuards(GetIdFromAuthGuard)
    @Get("/:id")
    async getDetailedPostInformation(@Request() req, @Param("id") id: string, @Res() res: Response) {
        const session = await this._mongoConnection.startSession();
        try {
            let postDetailedData = await this._postsService.getPostDetailedData(req.userId, id);
            return res.status(HttpStatus.OK).send(postDetailedData);
        } catch (error) {
            if (error instanceof HttpException)
                throw error;
            throw new HttpException("Unexpected server error", HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            await session.endSession();
        }
    }

    @HttpPost("/")
    @UseGuards(JwtAuthGuard, GetIdFromAuthGuard)
    @UseInterceptors(FilesInterceptor("files", 10))
    async createPost(@Request() req, @Body() createPostDto: CreatePostDto, @UploadedFiles() files, @Res() res: Response) {
        const session = await this._mongoConnection.startSession();
        try {
            let createdPost = await this._postsService.createPost(req.userId, createPostDto, files, session);
            return res.status(HttpStatus.CREATED).send(createdPost);
        } catch (error) {
            console.log(error);
            if (error instanceof HttpException)
                throw error;
            throw new HttpException("Unexpected server error", HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            await session.endSession();
        }
    }

    @UseGuards(JwtAuthGuard, GetIdFromAuthGuard)
    @HttpPost("/:id/like")
    async setLike(@Request() req, @Param("id") id: string, @Res() res: Response) {
        const session = await this._mongoConnection.startSession();
        try {
            await this._postsService.likePost(req.userId, id, session);
            return res.status(HttpStatus.OK).send({ message: "success" });
        } catch (error) {
            if (error instanceof HttpException)
                throw error;
            throw new HttpException("Unexpected server error", HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            await session.endSession();
        }
    }

    @UseGuards(JwtAuthGuard, GetIdFromAuthGuard)
    @Delete("/:id")
    async deletePost(@Request() req, @Param("id") id: string, @Res() res: Response) {
        const session = await this._mongoConnection.startSession();
        try {
            await this._postsService.deletePost(req.userId, id);
            return res.status(HttpStatus.OK).send({ message: "success" });
        } catch (error) {
            if (error instanceof HttpException)
                throw error;
            throw new HttpException("Unexpected server error", HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            await session.endSession();
        }
    }

    @HttpPost("/test/:link")
    async test(@Res() res: Response, @Param("link") link: string ) {
        let result = await parser(link);
        return res.status(HttpStatus.OK).send(JSON.stringify(result, null, 3));
    }

}
