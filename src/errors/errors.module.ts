import { Module } from "@nestjs/common";
import { IErrorsHelper } from "./errors.helper.interface";
import { ErrorsHelper } from "./errors.helper";

@Module({
    providers: [
        {
            provide: IErrorsHelper,
            useClass: ErrorsHelper
        }
    ],
    exports: [
        {
            provide: IErrorsHelper,
            useClass: ErrorsHelper
        }
    ]
})
export class ErrorsModule {
}
