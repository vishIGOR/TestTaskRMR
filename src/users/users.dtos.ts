import { ApiProperty } from "@nestjs/swagger";

export class LoginUserDto {
    @ApiProperty()
    email: string;
    @ApiProperty()
    password: string;
}

export class RegisterUserDto extends LoginUserDto {
    @ApiProperty()
    username: string;
    @ApiProperty()
    birthDate: Date;
}
