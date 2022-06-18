import { Module } from "@nestjs/common";
import { IFilesService } from "./files.service.interface";
import { FilesService } from "./files.service";

@Module({
    providers: [
        {
            provide: IFilesService,
            useClass: FilesService
        }
    ],
    exports: [
        {
            provide: IFilesService,
            useClass: FilesService
        }
    ]
})
export class FilesModule {

}
