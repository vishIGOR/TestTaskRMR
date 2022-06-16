import { Module } from "@nestjs/common";
import { IWebscrapingHelper } from "./webscraping.helper.interface";
import { WebscrapingHelper } from "./webscraping.helper";

@Module({
    providers: [
        {
            provide: IWebscrapingHelper,
            useClass: WebscrapingHelper
        }
    ],
    exports: [
        {
            provide: IWebscrapingHelper,
            useClass: WebscrapingHelper
        }
    ],

})
export class WebscrapingModule {
}
