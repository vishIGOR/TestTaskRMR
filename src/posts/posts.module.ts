import { Module } from '@nestjs/common';
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

@Module({
    providers: [
        {
            provide: IPostsHelper,
            useClass: PostsHelper
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
export class PostsModule {}
