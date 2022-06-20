import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Inject,
    Param,
    Request,
    Post as HttpPost,
    Res,
    UseGuards,
    UseInterceptors,
    Query,
    BadRequestException, UploadedFiles
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { IPostsService } from "./posts.service.interface";
import { CreatePostDto, GetPostDetailedDataDto, GetPostsDataWithPaginationDto } from "./posts.dtos";
import { Response } from "express";
import { GetIdFromAuthGuard, JwtAuthGuard } from "../auth/auth.guards";
import { FilesInterceptor } from "@nestjs/platform-express";
import { isInt } from "class-validator";

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
            " You can control number of posts with the query parameter limit and also skip posts by query parameter skip."
    })
    @ApiResponse({
        status: 200,
        description: "The request was processed successfully.",
        type: GetPostsDataWithPaginationDto
    })
    @ApiResponse({ status: 500, description: "Unexpected server error" })
    @ApiQuery({ name: "limit", required: false })
    @ApiQuery({ name: "skip", required: false })
    async getPosts(@Request() req, @Query("limit") limit: number, @Query("skip") skip: number, @Res() res: Response) {
        if ((!isInt(limit) && limit) || (!isInt(skip) && skip))
            throw new BadRequestException("Parameters 'Limit' or 'skip' are not number");

        if (typeof limit == "string")
            limit = Number.parseInt(limit);
        if (typeof skip == "string")
            skip = Number.parseInt(skip);

        let postDtosWithPagination = await this._postsService.getPosts(req.userId, limit, skip);
        return res.status(HttpStatus.OK).send(postDtosWithPagination);
    }

    @HttpPost("/")
    @UseGuards(JwtAuthGuard, GetIdFromAuthGuard)
    @UseInterceptors(FilesInterceptor("files", 10))
    @ApiOperation({
        summary: "Create new post",
        description: "Only for authorized users.\n Max number of files - 10.\n Previews will be created for all " +
            "urls in message. You can't add files in this endpoint in the swagger because there are no features " +
            "for uploading files and body parameters at the same time (I know about one but it's a crutch and this " +
            "solution conflicts with OOP."
    })
    @ApiResponse({
        status: 201,
        description: "The post was created successfully",
        type: GetPostDetailedDataDto
    })
    @ApiResponse({ status: 400, description: "Some validation error" })
    @ApiResponse({ status: 401, description: "User is not authorized" })
    @ApiResponse({ status: 415, description: "Filetype is invalid. Allowed filetypes: jpg, jpeg, png, gif, mp4, mov" })
    @ApiResponse({ status: 500, description: "Unexpected server error" })
    async createPost(@Request() req, @Body() createPostDto: CreatePostDto, @UploadedFiles() files, @Res() res: Response) {
        const session = await this._mongoConnection.startSession();

        let createdPost = await this._postsService.createPost(req.userId, createPostDto, files, session);
        return res.status(HttpStatus.CREATED).send(createdPost);

        await session.endSession();
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
        let postDetailedData = await this._postsService.getPostDetailedData(req.userId, id);
        return res.status(HttpStatus.OK).send(postDetailedData);
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
        await this._postsService.deletePost(req.userId, id);
        return res.status(HttpStatus.OK).send();
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

        await this._postsService.likePost(req.userId, id, session);
        return res.status(HttpStatus.OK).send();

        await session.endSession();
    }

}
