import * as UserDto from "@domain/model/User"
import * as UserSchema from "helpers/JoiSchema/User";
import UserDomainService from "@domain/service/UserDomainService"
import moment from 'moment'
import { checkPassword, hashPassword } from "helpers/Password/Password"
import { signJWT } from "helpers/jwt/jwt";
import { AppDataSource } from "@infrastructure/mysql/connection";

export default class AuthAppService {
    static async Register({level = 3, name, email, password}) {
        await UserSchema.Register.validateAsync({ level, name, email, password });

        await UserDomainService.GetEmailExistDomain(email)

        if (name == 'SuperAdmin') {
            throw new Error("Prohibited name")
        }

        const user = {
            name,
            email,
            password: await hashPassword(password),
            level,
            created_at: moment().unix()
        }

        let user_result = null

        const db = AppDataSource;
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            const {insertId} = await UserDomainService.CreateUserDomain(user, query_runner);

            const getUserById = await UserDomainService.GetUserByIdDomain(insertId, query_runner)
            user_result = getUserById[0]

            await query_runner.commitTransaction();
            await query_runner.release();
        } catch (error) {
            await query_runner.rollbackTransaction();
            await query_runner.release();
            throw error
        }

        const expiresIn = process.env.EXPIRES_IN || "1h"
        delete user_result.password


        const result = {
            token: await signJWT({
                userid: user_result.id,
                level: user_result.level
            }, process.env.JWT_SECRET || "TOKOPAEDI", { expiresIn }),
            user: user_result
        }

        return result
    }

    static async Login(params: UserDto.LoginParams) {
        const { email, password } = params
        await UserSchema.Login.validateAsync({ email, password });

        const existingUser = await UserDomainService.CheckUserExistsDomain(email)

        const checkPassworduUser = await checkPassword(params.password, existingUser.password)
        if (!checkPassworduUser){
            throw new Error ("Wrong Username Or Password")
        }

        const tmp_userdata = await UserDomainService.GetUserDataByIdDomain(existingUser.id)
        const tmp_grouprules = tmp_userdata.group_rules ? tmp_userdata.group_rules.split(",") : []

        const grouprules = tmp_grouprules.map(function (item) {
            return parseInt(item)
        })

        const user_data = {
            ...tmp_userdata,
            authority: grouprules
        }

        delete user_data.group_rules
        delete user_data.level

        const user_claims : UserDto.UserClaimsResponse = {
            id: user_data.id,
            level: user_data.level,
            authority: user_data.authority
        }

        const expiresIn = process.env.EXPIRES_IN || "1h"

        const result = {
            token: await signJWT({
                user_claims
            }, process.env.JWT_SECRET || "TOKOPAEDI", { expiresIn }),
            user: user_data
        }

        return result
    }
}