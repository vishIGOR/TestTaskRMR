import { Module } from "@nestjs/common";
import { IPostsHelper } from "./posts.helper.interface";
import { JwtService } from "@nestjs/jwt";
import { PostsHelper } from "./posts.helper";
import { Like, LikeSchema } from "../schemas/likes.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { FilesModule } from "../files/files.module";
import { LikesModule } from "../likes/likes.module";
import { ErrorsModule } from "../errors/errors.module";
import { WebscrapingModule } from "../webscraping/webscraping.module";
import { Post, PostSchema } from "../schemas/posts.schema";
import { PostsController } from "./posts.controller";
import { PostsService } from "./posts.service";
import { IPostsService } from "./posts.service.interface";

@Module({
    controllers: [PostsController],
    providers: [
        {
            provide: IPostsHelper,
            useClass: PostsHelper
        },
        {
            provide: IPostsService,
            useClass: PostsService
        },
        JwtService
    ],
    imports: [
        MongooseModule.forFeature([
            { name: Post.name, schema: PostSchema },
            { name: Like.name, schema: LikeSchema }
        ]),
        FilesModule,
        LikesModule,
        ErrorsModule,
        WebscrapingModule
    ]
})
export class PostsModule {
}
