import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class LoginUserDto {
    @ApiProperty({ default: "email@mail.ru" })
    @IsEmail()
    email: string;
    @ApiProperty({ default: "password" })
    @IsNotEmpty()
    password: string;
}

export class RegisterUserDto extends LoginUserDto {
    @ApiProperty({ default: "username" })
    @IsNotEmpty()
    username: string;
    @ApiProperty()
    @IsNotEmpty()
    birthDate: Date;
}
