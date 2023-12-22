import UserRepository from "@adapters/outbound/repository/UserRepository"
import { UserParamsDto } from "@domain/model/params"
import { UserResponseDto } from "@domain/model/response"
import { QueryRunner } from "typeorm"

export default class UserDomainService {
    static async CreateUserDomain(user: UserParamsDto.RegisterParams, query_runner?: QueryRunner) {
        return await UserRepository.DBCreateUser(user, query_runner)
    }

    static async GetEmailExistDomain(email: string): Promise<UserResponseDto.GetEmailExistResult[]> {
        const result = await UserRepository.DBGetEmailExist(email)

        if (result.length > 0) {
            throw new Error("Email already exist")
        }

        return result
    }

    static async CheckUserExistsDomain(email: string, query_runner?: QueryRunner) {
        const user = await UserRepository.DBCheckUserExists(email, query_runner)
        if (user.length < 1) {
            throw new Error("Account not found!")
        }
        return user[0]
    }

    static async GetUserDataByIdDomain(id: number, query_runner?: QueryRunner) {
        const result = await UserRepository.DBGetUserDataById(id, query_runner)
        if (result.length < 1) {
            throw new Error("User not found")
        }

        return result[0]
    }

    static async GetUserByIdDomain(id: number, query_runner?: QueryRunner) {
        const result = await UserRepository.DBGetUserById(id, query_runner)
        if (result.length < 1) {
            throw new Error("Cant get user")
        }

        return result[0]
    }

    static async GetUserEmailExistDomainService(email: string, query_runner?: QueryRunner) {
        return await UserRepository.DBGetUserEmailExist(email, query_runner)
    }

    static async UpdateUserEditProfileDomainService(params: UserParamsDto.UpdateUserEditProfileParams, query_runner?: QueryRunner) {
        const result = await UserRepository.DBUpdateUserEditProfile(params, query_runner)
        if (result.affectedRows < 1) {
            throw new Error("Failed update data")
        }
        return result
    }

    static async GetUserPasswordByIdDomain(id: number, query_runner?: QueryRunner) {
        const result = await UserRepository.DBGetUserPasswordById(id, query_runner)
        if (result.length < 1) {
            throw new Error("User not found")
        }

        return result[0]
    }

    static async UpdatePasswordDomain(passEncrypt: string, id: number, query_runner?: QueryRunner) {
        const result = await UserRepository.DBUpdatePassword(passEncrypt, id, query_runner)
        if (result.affectedRows < 1) {
            throw new Error("Failed change password")
        }
        return true
    }
}
