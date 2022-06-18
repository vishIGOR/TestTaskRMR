import { Module } from "@nestjs/common";
import { ILikesHelper } from "./likes.helper.interface";
import { LikesHelper } from "./likes.helper";
import { MongooseModule } from "@nestjs/mongoose";
import { Like, LikeSchema } from "../schemas/likes.schema";
import { FilesModule } from "../files/files.module";
import { ErrorsModule } from "../errors/errors.module";

@Module({
    providers: [
        {
            provide: ILikesHelper,
            useClass: LikesHelper
        }
    ],
    exports: [
        {
            provide: ILikesHelper,
            useClass: LikesHelper
        }
    ],
    imports: [
        MongooseModule.forFeature([
            { name: Like.name, schema: LikeSchema }
        ]),
        FilesModule,
        ErrorsModule
    ]
})
export class LikesModule {
}
