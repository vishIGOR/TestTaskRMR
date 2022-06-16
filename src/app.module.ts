import { Module } from "@nestjs/common";
import { UsersModule } from "./users/users.module";
import { DatabaseConfigModule } from "./database/database.module";
import { DatabaseConfigService } from "./database/database.config";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { FilesModule } from './files/files.module';
import { LikesModule } from "./likes/likes.module";
import { WebscrapingModule } from "./webscraping/webscraping.module";
import { ErrorsModule } from "./errors/errors.module";
import { PostsModule } from './posts/posts.module';

@Module({
    controllers: [],
    providers: [],
    imports: [
        ConfigModule.forRoot({
            envFilePath: ".env"
        }),
        DatabaseConfigModule,
        MongooseModule.forRootAsync({
            inject: [DatabaseConfigService],
            useFactory: async (configService: DatabaseConfigService) => configService.getMongoConfig()
        }),
        WebscrapingModule,
        ErrorsModule,
        UsersModule,
        AuthModule,
        LikesModule,
        FilesModule,
        PostsModule
    ]
})
export class AppModule {
}
