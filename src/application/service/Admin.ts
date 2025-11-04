import * as AdminSchema from "@helpers/JoiSchema/Admin"
import AdminDomainService from "@domain/service/AdminDomainService"
import UserDomainService from "@domain/service/UserDomainService"
import { checkPassword, hashPassword } from "@helpers/Password/Password"
import { AppDataSource } from "@infrastructure/mysql/connection"
import moment from "moment"
import { AdminParamsDto, LogParamsDto, UserParamsDto } from "@domain/model/params"
import { AdminResponseDto } from "@domain/model/response"
import LogDomainService from "@domain/service/LogDomainService"
import { CommonRequestDto } from "@domain/model/request"
import * as CommonSchema from "@helpers/JoiSchema/Common"
import { GenerateWhereClause, Paginate } from "key-pagination-sql"
import unicorn from "format-unicorn/safe"
import { Profanity } from "indonesian-profanity"
import jwt, { JwtPayload } from "jsonwebtoken"
import { signJWT } from "@helpers/jwt/jwt"
import { BadInputError } from "@domain/model/Error/Error"
import dotenvFlow from "dotenv-flow"
import path from "path"

//configuration for dotenv
dotenvFlow.config({ path: path.resolve(__dirname, `../../../`) })

export default class AdminAppService {
    static async GetAdminProfileService(id: number) {
        await AdminSchema.GetAdminProfile.validateAsync(id)

        const admin = await AdminDomainService.GetAdminDataDomain(id)

        return admin
    }

    static async CreateUserService({ id, level, name, email, password }: AdminParamsDto.CreateUserParams, logData: LogParamsDto.CreateLogParams) {
        await AdminSchema.CreateUser.validateAsync({ id, level, name, email, password })

        //Add name checking, can not use bad words for the product name
        if (Profanity.flag(name.toLowerCase())) {
            throw new BadInputError("YOUR_NAME_CONTAINS_CONTENT_THAT_DOES_NOT_MEET_OUR_COMMUNITY_STANDARDS_PLEASE_REVISE_YOUR_NAME")
        }

        await UserDomainService.GetEmailExistDomain(email)

        //if environtment TESTING is set to true, create a user with 10ms expiration time. this is made to ensure we can test the check expired account function.
        const isTesting = process.env.TESTING === "true"
        const expiresIn = parseInt(isTesting ? "10" : process.env.EXPIRES_IN)

        //Create an email token used to verify email.
        const email_token: string = await signJWT({ email }, process.env.JWT_SECRET, { expiresIn })
        const user = {
            name,
            email,
            password: await hashPassword(password),
            level,
            created_at: moment().unix(),
            email_token,
        }

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            const { insertId } = await UserDomainService.CreateUserDomain(user, query_runner)

            const user_result = await UserDomainService.GetUserByIdDomain(insertId, query_runner)

            //Insert into log, to track user action.
            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()

            return user_result
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }

    static async UpdateProfileUser(params: AdminParamsDto.UpdateProfileUserParams, logData: LogParamsDto.CreateLogParams) {
        await AdminSchema.UpdateProfileUser.validateAsync(params)

        //Add name checking, can not use bad words for the product name
        const banned = ["SuperAdmin", "Product Management Staff", "User Management Staff", "Shipping and Transaction Management Staff"]

        if (banned.includes(params.name) || Profanity.flag(params.name.toLowerCase())) {
            throw new BadInputError("YOUR_NAME_CONTAINS_CONTENT_THAT_DOES_NOT_MEET_OUR_COMMUNITY_STANDARDS_PLEASE_REVISE_YOUR_NAME")
        }

        await AdminDomainService.CheckIsUserAliveDomain(params.id)

        const user = await UserDomainService.GetUserDataByIdDomain(params.userid)

        if (user.email != params.email) {
            const userEmailExist = await UserDomainService.GetUserEmailExistDomainService(params.email)
            if (userEmailExist.length > 0) {
                throw new BadInputError("EMAIL_IS_NOT_AVAILABLE_TO_USE")
            }
        }

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

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

    static async UpdateProfileService(params: AdminParamsDto.UpdateProfileParams, logData: LogParamsDto.CreateLogParams) {
        await AdminSchema.UpdateProfile.validateAsync(params)

        const user = await UserDomainService.GetUserDataByIdDomain(params.id)

        if (user.email != params.email) {
            const userEmailExist = await UserDomainService.GetUserEmailExistDomainService(params.email)
            if (userEmailExist.length > 0) {
                throw new BadInputError("EMAIL_IS_NOT_AVAILABLE_TO_USE")
            }
        }

        if (Profanity.flag(params.name.toLowerCase())) {
            throw new BadInputError("YOUR_NAME_CONTAINS_CONTENT_THAT_DOES_NOT_MEET_OUR_COMMUNITY_STANDARDS_PLEASE_REVISE_YOUR_NAME")
        }

        const obj: UserParamsDto.UpdateUserEditProfileParams = {
            id: user.id,
            email: params.email,
            name: params.name,
        }

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

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

    static async SoftDeleteUserService(params: AdminParamsDto.DeleteUserParams, logData: LogParamsDto.CreateLogParams) {
        await AdminSchema.DeleteUser.validateAsync(params)

        await AdminDomainService.CheckIsUserAliveDomain(params.id)

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            const deleteUser = await AdminDomainService.SoftDeleteUserDomain(params.email, query_runner)

            //Insert into log, to track user action.
            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()
            return deleteUser
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }

    static async GetUserListService(paginationParams: CommonRequestDto.PaginationRequest) {
        await CommonSchema.Pagination.validateAsync(paginationParams)
        const { lastId = 0, limit = 100, search, sort = "ASC" } = paginationParams

        /*
        search filter, to convert filter field into sql string
        e.g: ({payment} = "Credit Card" AND {items_price} > 1000) will turn into ((t.payment_method = "Credit Card" AND t.items_price > 1000)) every field name need to be inside {}
        */
        let searchFilter = search || ""
        searchFilter = unicorn(searchFilter, {
            name: "u.name",
            email: "u.email",
            level: "u.level",
            isDeleted: "u.is_deleted",
        })

        //Generate whereClause
        const whereClause = GenerateWhereClause({ lastId, searchFilter, sort, tableAlias: "u", tablePK: "id" })

        const getUserList = await AdminDomainService.GetUserListDomain({ whereClause, limit: Number(limit), sort })

        //Generate pagination
        const result = Paginate({ data: getUserList, limit })

        return result
    }

    static async GetUserDetailProfileService(params: AdminParamsDto.GetUserDetailProfileParams) {
        await AdminSchema.GetUserDetailProfile.validateAsync(params)

        await AdminDomainService.CheckIsUserAliveDomain(params.id)

        const getUserDetailProfile = await AdminDomainService.GetUserDetailProfileDomain(params.email)

        return getUserDetailProfile
    }

    static async GetAdminListService(): Promise<AdminResponseDto.GetAdminListResponse[]> {
        const rules = await AdminDomainService.GetAdminList()

        return rules.map((element) => {
            return {
                name: element.name,
                rights: element.rights.split(","),
                rules_id: element.rules_id.split(",").map(Number),
            }
        })
    }

    static async GetRulesListService() {
        return await AdminDomainService.GetRulesList()
    }

    static async CreateRules(rule: string, logData: LogParamsDto.CreateLogParams) {
        await AdminSchema.CreateRule.validateAsync(rule)

        //checking duplicate, cannot update rule to an existing rule
        const existingRules = await AdminDomainService.GetRulesList()
        const duplicate = existingRules.some((existingRule) => existingRule.rules === rule)
        if (duplicate) {
            throw new BadInputError("RULE_ALREADY_EXISTS")
        }

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            await AdminDomainService.CreateRule(rule, query_runner)
            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()
            return true
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }

    static async UpdateRule(params: AdminParamsDto.UpdateRuleParams, logData: LogParamsDto.CreateLogParams) {
        await AdminSchema.UpdateRule.validateAsync(params)

        //checking duplicate, can't update rule to an existing rule
        const existingRules = await AdminDomainService.GetRulesList()
        const duplicate = existingRules.some((existingRule) => existingRule.rules === params.rule)
        if (duplicate) {
            throw new BadInputError("RULE_ALREADY_EXISTS")
        }

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            await AdminDomainService.UpdateRule(params, query_runner)
            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()
            return true
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }

    static async DeleteRule(rules_id: number, logData: LogParamsDto.CreateLogParams) {
        await AdminSchema.RulesId.validateAsync(rules_id)

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            await AdminDomainService.DeleteRule(rules_id, query_runner)
            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()
            return true
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }

    static async AssignRule(params: AdminParamsDto.AssignRuleParams, logData: LogParamsDto.CreateLogParams) {
        await AdminSchema.AssignRule.validateAsync(params)

        //Checking for duplicate, can't reassign existing rule to a group_id.
        const existingRulesOfGroups = await AdminDomainService.UserGroupRulesList(params.group_id)
        const rulesArray = existingRulesOfGroups.list_of_rules.split(",").map(Number)
        const duplicate = rulesArray.some((rule) => rule === params.rules_id)

        if (duplicate) {
            throw new BadInputError("CAN'T_REASSIGN_EXISTING_RULE")
        }

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            await AdminDomainService.AssignRule(params, query_runner)
            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()
            return true
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }

    static async RevokeRule(params: AdminParamsDto.RevokeRuleParams, logData: LogParamsDto.CreateLogParams) {
        await AdminSchema.RevokeRule.validateAsync(params)

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            await AdminDomainService.RevokeRule(params, query_runner)
            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()
            return true
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }

    static async ChangeUserPass(params: AdminParamsDto.ChangeUserPassParams, logData: LogParamsDto.CreateLogParams) {
        await AdminSchema.ChangeUserPass.validateAsync(params)

        await AdminDomainService.CheckIsUserAliveDomain(params.userid)

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            const encryptPass = await hashPassword(params.password)

            const sama = await checkPassword(params.confirmPassword, encryptPass)
            if (!sama) {
                throw new BadInputError("INVALID_CONFIRM_PASSWORD")
            }

            const result = await AdminDomainService.ChangeUserPassDomain(params.userid, encryptPass, query_runner)

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

    static async ChangePasswordService(params: AdminParamsDto.ChangePasswordParams, logData: LogParamsDto.CreateLogParams) {
        await AdminSchema.ChangePassword.validateAsync(params)

        const passEncrypt = await hashPassword(params.newPassword)

        const getUserById = await UserDomainService.GetUserPasswordByIdDomain(params.id)

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            const sama = await checkPassword(params.oldPassword, getUserById.password)
            if (!sama) {
                throw new BadInputError("INVALID_OLD_PASSWORD")
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

    static async TransactionListService(paginationParams: CommonRequestDto.PaginationRequest) {
        await CommonSchema.Pagination.validateAsync(paginationParams)
        const { lastId = 0, limit = 100, search, sort = "ASC" } = paginationParams

        /*
        search filter, to convert filter field into sql string
        e.g: ({payment} = "Credit Card" AND {items_price} > 1000) will turn into ((t.payment_method = "Credit Card" AND t.items_price > 1000)) every field name need to be inside {}
        */
        let searchFilter = search || ""
        searchFilter = unicorn(searchFilter, {
            payment: "t.payment_method",
            shipped_to: "t.shipping_address_id",
            items_price: "t.items_price",
            total_price: "t.total_price",
            created: "t.created_at",
            isDeleted: "t.is_deleted",
        })

        //Generate whereClause
        const whereClause = GenerateWhereClause({ lastId, searchFilter, sort, tableAlias: "t", tablePK: "id" })

        const transactionList = await AdminDomainService.GetTransactionListDomain({ whereClause, limit: Number(limit), sort })
        //Generate pagination
        const result = Paginate({ data: transactionList, limit })

        return result
    }

    static async GetUserShippingAddressService(paginationParams: CommonRequestDto.PaginationRequest) {
        await CommonSchema.Pagination.validateAsync(paginationParams)
        const { lastId = 0, limit = 100, search, sort = "ASC" } = paginationParams

        /*
        search filter, to convert filter field into sql string
        e.g: ({payment} = "Credit Card" AND {items_price} > 1000) will turn into ((t.payment_method = "Credit Card" AND t.items_price > 1000))
        every field name need to be inside {}
        */
        let searchFilter = search || ""
        searchFilter = unicorn(searchFilter, {
            id: "sa.id",
            user_id: "sa.user_id",
            city: "sa.city",
        })

        //Generate whereClause
        const whereClause = GenerateWhereClause({ lastId, searchFilter, sort, tableAlias: "sa", tablePK: "id" })
        const getUserShipping = await AdminDomainService.GetUserShippingAddressDomain({ whereClause, limit: Number(limit), sort })
        const result = Paginate({ data: getUserShipping, limit })
        return result
    }

    static async UpdateUserLevelService(params: AdminParamsDto.UpdateUserLevelParams, logData: LogParamsDto.CreateLogParams) {
        await AdminSchema.UpdateUserLevel.validateAsync(params)

        await AdminDomainService.CheckIsUserAliveDomain(params.user_id)

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            const updateUserLevel = await AdminDomainService.UpdateUserLevelDomain(params.user_id, params.level, query_runner)

            //Insert into log, to track user action.
            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()

            return updateUserLevel
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }

    static async RestoreDeletedUserService(user_id: number, logData: LogParamsDto.CreateLogParams) {
        await AdminSchema.UserId.validateAsync(user_id)

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            await AdminDomainService.RestoreDeletedUserDomain(user_id, query_runner)
            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()
            return true
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }

    static async CheckExpiredAccount() {
        //check expired account, filter it from unverified account.
        const expiredAccounts = (await AdminDomainService.CheckExpiredAccountDomain())
            .map((acc) => ({ id: acc.id, token: acc.email_token }))
            .map((acc) => {
                const decoded = jwt.decode(acc.token) as JwtPayload
                return decoded ? { id: acc.id, isExpired: decoded.exp < moment().unix() } : undefined
            })
            .filter((account) => account?.isExpired)

        //if there is an expired account or more, delete it permanently (hard delete).
        if (expiredAccounts.length !== 0) {
            const db = AppDataSource
            const query_runner = db.createQueryRunner()
            await query_runner.connect()

            try {
                await query_runner.startTransaction()

                const logData: LogParamsDto.CreateLogParams = { user_id: 1, action: `Delete Expired Account #`, browser: `CRON JOB`, ip: "127.0.0.1", time: moment().unix() }

                await Promise.all(expiredAccounts.map((acc) => Promise.all([AdminDomainService.HardDeleteUserDomain(acc.id, query_runner), LogDomainService.CreateLogDomain({ ...logData, action: `Delete Expired Account #${acc.id}` }, query_runner)])))
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
}
