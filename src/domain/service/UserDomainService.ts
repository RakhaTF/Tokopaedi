import UserRepository from "@adapters/outbound/repository/UserRepository"
import * as UserDto from "@domain/model/User"
import { QueryRunner } from 'typeorm';

export default class UserDomainService {
    static async CreateUserDomain(user: UserDto.CreateUserParams, query_runner?: QueryRunner) {
        return await UserRepository.DBCreateUser(user, query_runner)
    }

    static async GetEmailExistDomain(email: string): Promise<UserDto.GetEmailExistResult[]> {
        const result = await UserRepository.DBGetEmailExist(email);

        if (result.length > 0){
            throw new Error ("Email already exist")
        }

        return result
    }

    static async CheckUserExistsDomain(email: string) {
        const user = await UserRepository.DBCheckUserExists(email);
        if (user.length < 1) {
            throw new Error("Account not found!")
        }
        return user[0];
    }

    static async GetUserDataByIdDomain(id: number) {
        const result = await UserRepository.DBGetUserDataById(id)
        if (result.length < 1){
            throw new Error("User not found")
        }

        return result[0]
    }

    static async GetUserByIdDomain(id: number, query_runner?: QueryRunner) {
        const result = await UserRepository.DBGetUserById(id, query_runner)
        if (result.length < 1){
            throw new Error("Cant get user")
        }

        return result[0] 
    }
}