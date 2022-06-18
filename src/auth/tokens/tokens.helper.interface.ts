import { User } from "../../schemas/users.schema";


export interface ITokensHelper{
    generateRefreshToken(): string
    generateAccessToken(user: User): Promise<string>
}
export const ITokensHelper = Symbol("ITokensHelper");