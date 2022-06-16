import { AllHeadDataDto, SiteMetaDataDto, SitePreviewDataDto } from "./webscraping.dtos";

export interface IWebscrapingHelper {
    getAllHeadData(link: string): Promise<AllHeadDataDto>;

    getAllLinksFromText(text: string): string[]
}

export const IWebscrapingHelper = Symbol("IWebscrapingHelper");