import { Module } from "@nestjs/common";
import { UsersModule } from "./users/users.module";
import { DatabaseConfigModule } from "./database/database.module";
import { DatabaseConfigService } from "./database/database.config";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { FilesModule } from './files/files.module';

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
        UsersModule,
        AuthModule,
        FilesModule
    ]
})
export class AppModule {
}
