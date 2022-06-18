import { ApiProperty } from "@nestjs/swagger";

export class SiteMetaDataDto {
    title: string;
    description: string;
}

export class SitePreviewDataDto {
    @ApiProperty()
    url: string;
    @ApiProperty()
    title: string;
    @ApiProperty()
    description: string;
    @ApiProperty()
    image: string;
}

export class AllHeadDataDto {
    metaData: SiteMetaDataDto;
    previewData: SitePreviewDataDto;

}