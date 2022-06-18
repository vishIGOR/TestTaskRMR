import { User } from "../schemas/users.schema";


export interface IUsersHelper{
    getUserById(id: string): Promise<User>
    getUserByEmail(email: string): Promise<User>
    getUserByUsername(username: string): Promise<User>
    getUserByRefreshToken(token: string): Promise<User>
    setPassword(user: User, password: string): void
    isPasswordValid(user: User, password: string): boolean
}
export const IUsersHelper = Symbol("IUsersHelper");