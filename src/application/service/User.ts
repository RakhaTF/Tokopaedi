import { LogParamsDto, UserParamsDto } from "@domain/model/params"
import UserDomainService from "@domain/service/UserDomainService"
import * as UserSchema from "@helpers/JoiSchema/User"
import { checkPassword, hashPassword } from "@helpers/Password/Password"
import LogDomainService from "@domain/service/LogDomainService"
import { AppDataSource } from "@infrastructure/mysql/connection"
import { Profanity } from "indonesian-profanity"
export default class UserAppService {
    static async GetUserProfileService(id) {
        await UserSchema.GetUserProfile.validateAsync(id)

        const user = await UserDomainService.GetUserDataByIdDomain(id)

        return user
    }

    static async UpdateUserProfileService(params: UserParamsDto.UpdateUserParams, logData: LogParamsDto.CreateLogParams) {
        await UserSchema.UpdateUserProfile.validateAsync(params)

        //Additional name checking
        const banned = ["SuperAdmin", "Product Management Staff", "User Management Staff", "Shipping and Transaction Management Staff"]

        if (banned.includes(params.name) || Profanity.flag(params.name)) {
            throw new Error("Banned words name")
        }

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            const user = await UserDomainService.GetUserDataByIdDomain(params.id, query_runner)

            if (user.email != params.email) {
                const userEmailExist = await UserDomainService.GetUserEmailExistDomainService(params.email, query_runner)
                if (userEmailExist.length > 0) {
                    throw new Error("Email is not available")
                }
            }

            const obj: UserParamsDto.UpdateUserEditProfileParams = {
                id: user.id,
                email: params.email,
                name: params.name,
            }

            await UserDomainService.UpdateUserEditProfileDomainService(obj, query_runner)

            //Insert into log, to track user action.
            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()

            return obj
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }

    static async ChangePasswordService(params: UserParamsDto.ChangePasswordParams, logData: LogParamsDto.CreateLogParams) {
        await UserSchema.ChangePassword.validateAsync(params)

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            const passEncrypt = await hashPassword(params.newPassword)

            const getUserById = await UserDomainService.GetUserPasswordByIdDomain(params.id, query_runner)

            const sama = await checkPassword(params.oldPassword, getUserById.password)
            if (!sama) {
                throw new Error("Invalid old password")
            }

            const result = await UserDomainService.UpdatePasswordDomain(passEncrypt, params.id, query_runner)

            //Insert into log, to track user action.
            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()
            return result
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }
}
