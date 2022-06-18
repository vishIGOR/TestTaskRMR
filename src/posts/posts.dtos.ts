import { ApiProperty } from "@nestjs/swagger";
import { SitePreviewDataDto } from "../webscraping/webscraping.dtos";

export class CreatePostDto {
    @ApiProperty()
    message: string;
}

export class GetPostDto {
    @ApiProperty()
    id: string;
    @ApiProperty()
    message: string;
    @ApiProperty()
    fileNames: string[];
    @ApiProperty()
    likes: number;
    @ApiProperty()
    isLikedByCurrentUser: boolean = false;
}


export class GetPostDetailedDataDto extends GetPostDto {
    @ApiProperty()
    authorId: string;
    @ApiProperty()
    createdAt: Date;
    @ApiProperty()
    previews: SitePreviewDataDto[];
}

export class PagesData {
    @ApiProperty()
    nextSkip: number = null;
    @ApiProperty()
    totalNumberOfPages: number = null;
}

export class GetPostsDataWithPaginationDto {
    @ApiProperty()
    pagesData: PagesData;
    @ApiProperty()
    posts: GetPostDto[];
}
