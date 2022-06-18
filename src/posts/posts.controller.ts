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
    UseInterceptors, Put, Query, ParseIntPipe
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection, Schema as MongooseSchema } from "mongoose";
import { IPostsService } from "./posts.service.interface";
import { CreatePostDto, GetPostDetailedDataDto, GetPostsDataWithPaginationDto } from "./posts.dtos";
import { Response } from "express";
import { GetIdFromAuthGuard, JwtAuthGuard } from "../auth/auth.guards";
import { FilesInterceptor } from "@nestjs/platform-express";
import { FilesUploadDto } from "../files/files.dtos";

@Controller("posts")
@ApiTags("Posts")
@ApiBearerAuth()
export class PostsController {
    constructor(@InjectConnection() private readonly _mongoConnection: Connection,
                @Inject(IPostsService) private readonly _postsService: IPostsService) {
    }

    @UseGuards(GetIdFromAuthGuard)
    @Get("/")
    @ApiOperation({
        summary: "Get posts",
        description: "Accessible without token. But with token you can get the information about likes by current user." +
            "\n You can control number of posts with the query parameter limit and also skip posts by query parameter from"
    })
    @ApiResponse({
        status: 200,
        description: "The request was processed successfully",
        type: GetPostsDataWithPaginationDto
    })
    @ApiResponse({ status: 500, description: "Unexpected server error" })
    @ApiQuery({ name: "limit", required: false })
    @ApiQuery({ name: "from", required: false })
    async getPosts(@Request() req, @Query("limit", ParseIntPipe) limit: number, @Query("from", ParseIntPipe) from: number, @Res() res: Response) {
        const session = await this._mongoConnection.startSession();
        try {
            let postDtosWithPagination = await this._postsService.getPosts(req.userId, limit, from);
            return res.status(HttpStatus.OK).send(postDtosWithPagination);
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
    @ApiOperation({
        summary: "Create new post",
        description: "Only for authorized users.\n Max number of files - 10.\n Previews will be created for all urls in message."
    })
    @ApiConsumes("multipart/form-data")
    @ApiResponse({
        status: 201,
        description: "The post was created successfully",
        type: GetPostDetailedDataDto
    })
    //TODO
    @ApiResponse({ status: 400, description: "Some validation error" })
    @ApiResponse({ status: 401, description: "User is not authorized" })
    @ApiResponse({ status: 500, description: "Unexpected server error" })
    async createPost(@Request() req, @Body() createPostDto: CreatePostDto, @Res() res: Response) {
        const session = await this._mongoConnection.startSession();
        try {
            let createdPost = await this._postsService.createPost(req.userId, createPostDto, createPostDto.files, session);
            return res.status(HttpStatus.CREATED).send(createdPost);
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
    @ApiOperation({
        summary: "Get the post's detailed information",
        description: "Accessible without token. But with token you can get the information about likes by current user"
    })
    @ApiResponse({
        status: 200,
        description: "The request was processed successfully",
        type: GetPostDetailedDataDto
    })
    @ApiResponse({ status: 404, description: "Post with this id doesn't exists" })
    @ApiResponse({ status: 500, description: "Unexpected server error" })
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

    @UseGuards(JwtAuthGuard, GetIdFromAuthGuard)
    @Delete("/:id")
    @ApiOperation({
        summary: "Delete the post",
        description: "Only for the authorized author of this post"
    })
    @ApiResponse({
        status: 200,
        description: "The post was deleted successfully"
    })
    @ApiResponse({ status: 401, description: "User is not authorized" })
    @ApiResponse({ status: 403, description: "Authorized user isn't an author of this post" })
    @ApiResponse({ status: 404, description: "Post with this id doesn't exists" })
    @ApiResponse({ status: 500, description: "Unexpected server error" })
    async deletePost(@Request() req, @Param("id") id: string, @Res() res: Response) {
        const session = await this._mongoConnection.startSession();
        try {
            await this._postsService.deletePost(req.userId, id);
            return res.status(HttpStatus.OK).send();
        } catch (error) {
            if (error instanceof HttpException)
                throw error;
            throw new HttpException("Unexpected server error", HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            await session.endSession();
        }
    }

    @UseGuards(JwtAuthGuard, GetIdFromAuthGuard)
    @HttpPost("/:id/like")
    @ApiOperation({
        summary: "Like the post",
        description: "Only for authorized users. A re-request will delete the like."
    })
    @ApiResponse({ status: 200, description: "The post was liked successfully" })
    @ApiResponse({ status: 401, description: "User is not authorized" })
    @ApiResponse({ status: 404, description: "Post with this id doesn't exists" })
    @ApiResponse({ status: 500, description: "Unexpected server error" })
    async setLike(@Request() req, @Param("id") id: string, @Res() res: Response) {
        const session = await this._mongoConnection.startSession();
        try {
            await this._postsService.likePost(req.userId, id, session);
            return res.status(HttpStatus.OK).send();
        } catch (error) {
            if (error instanceof HttpException)
                throw error;
            throw new HttpException("Unexpected server error", HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            await session.endSession();
        }
    }

}
