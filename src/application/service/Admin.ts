import * as AdminSchema from "helpers/JoiSchema/Admin";
import AdminDomainService from "@domain/service/AdminDomainService";
import UserDomainService from "@domain/service/UserDomainService";
import { checkPassword, hashPassword } from "helpers/Password/Password"
import { AppDataSource } from "@infrastructure/mysql/connection";
import moment from 'moment'
import { AdminParamsDto, LogParamsDto, UserParamsDto } from "@domain/model/params";
import { AdminResponseDto } from "@domain/model/response";
import LogDomainService from "@domain/service/LogDomainService";

const prohibitedWords = require("indonesian-badwords")

export default class AdminAppService {
    static async GetAdminProfileService({id}){
        await AdminSchema.GetAdminProfile.validateAsync({id})

        const admin = await AdminDomainService.GetAdminDataDomain(id)

        return admin
    }

    static async CreateUserService({id, level = 3, name, email, password}, logData: LogParamsDto.CreateLogParams){
        await AdminSchema.CreateUser.validateAsync({id, level, name, email, password})

        await UserDomainService.GetEmailExistDomain(email)

        const user = {
            name: name,
            email: email,
            password: await hashPassword(password),
            level,
            created_at: moment().unix()
        }

        const db = AppDataSource;
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            const {insertId} = await UserDomainService.CreateUserDomain(user, query_runner);

            const user_result = await UserDomainService.GetUserByIdDomain(insertId, query_runner)

            //Insert into log, to track user action.
            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction();
            await query_runner.release();

            return user_result
        } catch (error) {
            await query_runner.rollbackTransaction();
            await query_runner.release();
            throw error
        }
    }

    static async UpdateProfileUser(params: AdminParamsDto.UpdateProfileUserParams, logData: LogParamsDto.CreateLogParams ){
        await AdminSchema.UpdateProfileUser.validateAsync(params)

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            const user = await UserDomainService.GetUserDataByIdDomain(params.userid,query_runner)

            if (user.id < 1){
                throw new Error ("User not found")
            }

            if (user.email != params.email){
                let userEmailExist = await UserDomainService.GetUserEmailExistDomainService(params.email, query_runner)
                if (userEmailExist.length > 0) {
                    throw new Error ("Email is not available")
                }
            }

            let banned = [
                "SuperAdmin",
                "Product Management Staff",
                "User Management Staff",
                "Shipping and Transaction Management Staff",
            ]

            if (banned.includes(params.name) || prohibitedWords.flag(params.name)){
                throw new Error("Banned words name")
            }

            const obj: UserParamsDto.UpdateUserEditProfileParams = {
                id: user.id,
                email: params.email,
                name: params.name
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

    static async UpdateProfileService(params: AdminParamsDto.UpdateProfileParams){
        await AdminSchema.UpdateProfile.validateAsync(params)

        if (params.id < 1){
            throw new Error ("User not found")
        }

        const user = await UserDomainService.GetUserDataByIdDomain(params.id)

        if (user.id < 1){
            throw new Error ("User not found")
        }

        if (user.email != params.email){
            let userEmailExist = await UserDomainService.GetUserEmailExistDomainService(params.email)
            if (userEmailExist.length > 0) {
                throw new Error ("Email is not available")
            }
        }

        let banned = [
            "SuperAdmin",
            "Product Management Staff",
            "User Management Staff",
            "Shipping and Transaction Management Staff",
        ]

        if (banned.includes(params.name) || prohibitedWords.flag(params.name)){
            throw new Error("Banned words name")
        }

        const obj: UserParamsDto.UpdateUserEditProfileParams = {
            id: user.id,
            email: params.email,
            name: params.name
        }

        await UserDomainService.UpdateUserEditProfileDomainService(obj)

        return obj
    }

    static async DeleteUserService(params: AdminParamsDto.DeleteUserParams, logData: LogParamsDto.CreateLogParams){
        await AdminSchema.DeleteUser.validateAsync(params)

        if (params.id < 1){
            throw new Error ("User not found")
        }

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            const deleteUser = await AdminDomainService.DeleteUserDomain(params.email, query_runner)

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

    static async GetUserListService(){
        const getUserList = await AdminDomainService.GetUserListDomain()

        return getUserList
    }

    static async GetUserDetailProfileService(params: AdminParamsDto.GetUserDetailProfileParams){
        await AdminSchema.GetUserDetailProfile.validateAsync(params)

        if (params.id < 1){
            throw new Error ("User not found")
        }

        const getUserDetailProfile = await AdminDomainService.GetUserDetailProfileDomain(params.email)

        return getUserDetailProfile
    }

    static async GetAdminListService(): Promise<AdminResponseDto.GetAdminListResponse[]> {
        const rules = await AdminDomainService.GetAdminList()

        return rules.map(element => {
            return {
                name: element.name,
                rights: element.rights.split(","),
                rules_id: element.rules_id.split(",").map(Number)
            }
        });
    }

    static async GetRulesListService() {
        return await AdminDomainService.GetRulesList()
    }

    static async CreateRules(rule: string, logData: LogParamsDto.CreateLogParams) {
        await AdminSchema.CreateRule.validateAsync(rule)

        //checking duplicate, cannot update rule to an existing rule 
        const existingRules = await AdminDomainService.GetRulesList()
        const duplicate = existingRules.some((existingRule) => existingRule.rules === rule);
        if (duplicate) {
            throw new Error("Rule Already Exist!")
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
            return true;
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error;
        }
    }

    static async UpdateRule(params: AdminParamsDto.UpdateRuleParams, logData: LogParamsDto.CreateLogParams) {
        await AdminSchema.UpdateRule.validateAsync(params)

        //checking duplicate, can't update rule to an existing rule 
        const existingRules = await AdminDomainService.GetRulesList()
        const duplicate = existingRules.some((existingRule) => existingRule.rules === params.rule);
        if (duplicate) {
            throw new Error("Rule Already Exist!")
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
            return true;
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error;
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
            return true;
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error;
        }
    }

    static async AssignRule(params: AdminParamsDto.AssignRuleParams, logData: LogParamsDto.CreateLogParams) {
        await AdminSchema.AssignRule.validateAsync(params)

        //Checking for duplicate, can't reassign existing rule to a group_id.
        const existingRulesOfGroups = await AdminDomainService.UserGroupRulesList(params.group_id)
        const rulesArray = existingRulesOfGroups.list_of_rules.split(",").map(Number)
        const duplicate = rulesArray.some((rule) => rule === params.rules_id)

        if(duplicate){
            throw new Error("Can't Reassign Existing Rule!")
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
            return true;
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error;
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
            return true;
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error;
        }
    }

    static async ChangeUserPass(params: AdminParamsDto.ChangeUserPassParams, logData: LogParamsDto.CreateLogParams) {
        await AdminSchema.ChangeUserPass.validateAsync(params)

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            const encryptPass = await hashPassword(params.password)

            const sama = await checkPassword(params.confirmPassword, encryptPass)
            if (!sama){
                throw new Error ("Invalid Confirm Password")
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

    static async ChangePasswordService(params: AdminParamsDto.ChangePasswordParams){
        await AdminSchema.ChangePassword.validateAsync(params)

        if (params.id < 1){
            throw new Error ("User not found")
        }

        const passEncrypt = await hashPassword(params.newPassword)

        const getUserById = await UserDomainService.GetUserPasswordByIdDomain(params.id)

        if (getUserById.id > 1){
            const sama = await checkPassword(params.oldPassword, getUserById.password)
            if (!sama){
                throw new Error ("Invalid old password")
            }

            const result = await UserDomainService.UpdatePasswordDomain(passEncrypt, params.id)
            return result
        }
    }

    static async TransactionListService(){
        return await AdminDomainService.GetTransactionListDomain()
    }

    static async GetUserShippingAddressService(){
        return await AdminDomainService.GetUserShippingAddressDomain()
    }

    static async UpdateUserLevelService(params: AdminParamsDto.UpdateUserLevelParams){
        await AdminSchema.UpdateUserLevel.validateAsync(params)

        const updateUserLevel = await AdminDomainService.UpdateUserLevelDomain(params.user_id, params.level)

        return updateUserLevel
    }
}