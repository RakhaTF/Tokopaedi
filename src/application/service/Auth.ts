import * as UserSchema from "@helpers/JoiSchema/User"
import UserDomainService from "@domain/service/UserDomainService"
import moment from "moment"
import { checkPassword, hashPassword } from "@helpers/Password/Password"
import { signJWT, verifyJWT } from "@helpers/jwt/jwt"
import { AppDataSource } from "@infrastructure/postgres/connection"
import { LogParamsDto, UserParamsDto } from "@domain/model/params"
import { UserResponseDto } from "@domain/model/response"
import LogDomainService from "@domain/service/LogDomainService"
import { Profanity } from "indonesian-profanity"
import { emailer } from "@infrastructure/mailer/mailer"
import { UserRequestDto } from "@domain/model/request"

export default class AuthAppService {
    static async Register({ level, name, email, password }: UserRequestDto.RegisterRequest) {
        await UserSchema.Register.validateAsync({ level, name, email, password })

        //Add name checking, can not use bad words for the user name
        if (Profanity.flag(name.toLowerCase()) || name.toLowerCase() === "superadmin") {
            throw new Error("You can't use this name!")
        }

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            await UserDomainService.GetEmailExistDomain(email)

            const expiresIn = process.env.EXPIRES_IN || "1h"

            //Create an email token used to verify email.
            const email_token: string = await signJWT({ email: email }, process.env.JWT_SECRET, { expiresIn, noTimestamp: true })
            const user = {
                name,
                email,
                password: await hashPassword(password),
                level,
                created_at: moment().unix(),
                email_token,
            }

            const insertId = await UserDomainService.CreateUserDomain(user, query_runner)
            console.log({insertId})
            const user_result = await UserDomainService.GetUserByIdDomain(insertId, query_runner)

            //Email service to notify newly registered user and admin.
            emailer.notifyUserForSignup(email, name, email_token)
            emailer.notifyAdminForNewUser(email, name)

            await query_runner.commitTransaction()
            await query_runner.release()
            return user_result
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }

    static async Login(params: UserParamsDto.LoginParams, logData: LogParamsDto.CreateLogParams) {
        const { email, password } = params
        await UserSchema.Login.validateAsync({ email, password })

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            const existingUser = await UserDomainService.CheckUserExistsDomain(email, query_runner)
            //if user is deleted and they attempt to login, throw an error.
            if (existingUser.is_deleted === true) {
                throw new Error("Your account is deleted, please contact an admin")
            }

            if (existingUser.is_verified === false) {
                throw new Error("Please verify your email first!")
            }

            const checkPasswordUser = await checkPassword(params.password, existingUser.password)
            if (!checkPasswordUser) {
                throw new Error("Wrong Username Or Password")
            }

            const tmp_userdata = await UserDomainService.GetUserDataByIdDomain(existingUser.id, query_runner)
            const tmp_grouprules = tmp_userdata.group_rules ? tmp_userdata.group_rules.split(",") : []

            const grouprules = tmp_grouprules.map(function (item) {
                return parseInt(item)
            })

            const user_data = {
                ...tmp_userdata,
                authority: grouprules,
            }

            delete user_data.group_rules

            const user_claims: UserResponseDto.UserClaimsResponse = {
                id: user_data.id,
                level: user_data.level,
                authority: user_data.authority,
            }
            const expiresIn = process.env.EXPIRES_IN || "1h"

            const result = {
                token: await signJWT(user_claims, process.env.JWT_SECRET || "TOKOPAEDI", { expiresIn }),
                user: user_data,
            }

            //Insert into log, to track user action.
            await LogDomainService.CreateLogDomain({ ...logData, user_id: user_data.id }, query_runner)

            await query_runner.commitTransaction()

            return result
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        } finally {
            await query_runner.release()
        }
    }

    static async VerifyEmail(token: string, logData: LogParamsDto.CreateLogParams) {
        await UserSchema.VerifyEmail.validateAsync(token)

        await verifyJWT(token, process.env.JWT_SECRET)

        //getting user data to verify
        const user = await UserDomainService.FindUserByTokenDomain(token)

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            //verify the email
            await UserDomainService.VerifyEmailDomain(user.email, query_runner)
            await LogDomainService.CreateLogDomain({ ...logData, user_id: user.id }, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()
            return true
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }
}
