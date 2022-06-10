import { Module } from "@nestjs/common";
import { IUsersHelper } from "./users.helper.interface";
import { User, UserSchema } from "../schemas/users.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersHelper } from "./users.helper";

@Module({
    controllers: [],
    providers: [
        {
            provide: IUsersHelper,
            useClass: UsersHelper
        }
    ],
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema }
        ])
    ],
    exports: [
        {
            provide: IUsersHelper,
            useClass: UsersHelper
        }
    ]
})
export class UsersModule {
}
