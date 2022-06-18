import { Injectable } from "@nestjs/common";
import { IWebscrapingHelper } from "./webscraping.helper.interface";
import { AllHeadDataDto, SiteMetaDataDto, SitePreviewDataDto } from "./webscraping.dtos";
import { parser } from "html-metadata-parser";
const extractUrls = require("extract-urls");

@Injectable()
export class WebscrapingHelper implements IWebscrapingHelper {
    getAllLinksFromText(text: string): string[] {
        return extractUrls(text) || [];
    }

    async getAllHeadData(link: string): Promise<AllHeadDataDto> {
        let rawData;

        try {
            rawData = await parser(link);
        } catch (error) {
            return null;
        }

        let headData = new AllHeadDataDto();
        headData.metaData = this.getMetaDataDtoFromParserResult(rawData);
        headData.previewData = this.getPreviewDataDtoFromParserResult(rawData);
        headData.previewData.url = link;

        return headData;
    }

    private getMetaDataDtoFromParserResult(parserResult) {
        let metaData = new SiteMetaDataDto();
        metaData.title = parserResult.meta.title;
        metaData.description = parserResult.meta.description;

        return metaData;
    }

    private getPreviewDataDtoFromParserResult(parserResult) {
        let previewData = new SitePreviewDataDto();
        previewData.title = parserResult.og.title;
        previewData.description = parserResult.og.description;
        previewData.image = parserResult.og.image;

        return previewData;
    }
}