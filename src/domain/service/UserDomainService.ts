import UserRepository from "@adapters/outbound/repository/UserRepository"
import { User } from "@domain/entity/User"
import * as UserDto from "@domain/model/User"
import jwt from 'jsonwebtoken'
import { env } from "process"

export default class UserDomainService {
    static async CreateUser(user: UserDto.CreateUserParams) {
        return await UserRepository.DBCreateUser(user)
    }

    static async GetUserDomain(params: { email?: string, id?: number }): Promise<User> {
        if (params.email) {
            return await UserRepository.DBGetOneUser({ email: params.email });
        } else if (params.id) {
            return await UserRepository.DBGetOneUser({ id: params.id });
        } else {
            throw new Error("Either email or id must be provided");
        }
    }

    static async CheckUserExistsDomain(email: string) {
        const user = await UserRepository.DBCheckUserExists(email);
        if (user.length < 1) {
            throw new Error("Account not found!")
        }
        return user[0];
    }
}