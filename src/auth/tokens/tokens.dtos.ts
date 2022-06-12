import { ApiProperty } from "@nestjs/swagger";

export class RefreshTokenDto {
    @ApiProperty()
    refreshToken: string;
}

export class TokenPairDto extends RefreshTokenDto{
    @ApiProperty()
    accessToken: string;
}

export class JwtPayload {
    id: string;
}