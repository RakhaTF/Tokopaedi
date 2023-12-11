import * as AdminSchema from "helpers/JoiSchema/Admin";
import AdminDomainService from "@domain/service/AdminDomainService";
import UserDomainService from "@domain/service/UserDomainService";
import { hashPassword } from "helpers/Password/Password"
import { AppDataSource } from "@infrastructure/mysql/connection";
import moment from 'moment'
import { AdminParamsDto, UserParamsDto } from "@domain/model/params";
import { AdminResponseDto } from "@domain/model/response";

const prohibitedWords = require("indonesian-badwords")

export default class AdminAppService {
    static async GetAdminProfileService({id}){
        await AdminSchema.GetAdminProfile.validateAsync({id})

        const admin = await AdminDomainService.GetAdminDataDomain(id)

        return admin
    }

    static async CreateUserService({id, level = 3, name, email, password}){
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

            await query_runner.commitTransaction();
            await query_runner.release();

            return user_result
        } catch (error) {
            await query_runner.rollbackTransaction();
            await query_runner.release();
            throw error
        }
    }

    static async UpdateProfileUser(params: AdminParamsDto.UpdateProfileUserParams){
        await AdminSchema.UpdateProfileUser.validateAsync(params)

        const user = await UserDomainService.GetUserDataByIdDomain(params.userid)

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

    static async DeleteUserService(params: AdminParamsDto.DeleteUserParams){
        await AdminSchema.DeleteUser.validateAsync(params)

        if (params.id < 1){
            throw new Error ("User not found")
        }

        const deleteUser = await AdminDomainService.DeleteUserDomain(params.email)

        return deleteUser
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

    static async CreateRules(rule: string) {
        await AdminSchema.CreateRule.validateAsync(rule)
        const existingRules = await AdminDomainService.GetRulesList()

        const duplicate = existingRules.some((existingRule) => existingRule.rules === rule);
        if (duplicate) {
            throw new Error("Rule Already Exist!")
        }
        await AdminDomainService.CreateRule(rule)
        return true;
    }

    static async UpdateRule(params: AdminParamsDto.UpdateRuleParams) {
        await AdminSchema.UpdateRule.validateAsync(params)
        const existingRules = await AdminDomainService.GetRulesList()

        const duplicate = existingRules.some((existingRule) => existingRule.rules === params.rule);
        if (duplicate) {
            throw new Error("Rule Already Exist!")
        }
        await AdminDomainService.UpdateRule(params)
        return true;
    }

    static async DeleteRule(rules_id: number) {
        await AdminSchema.RulesId.validateAsync(rules_id)
        await AdminDomainService.DeleteRule(rules_id)
        return true;
    }

    static async AssignRule(params: AdminParamsDto.AssignRuleParams) {
        await AdminSchema.AssignRule.validateAsync(params)
        await AdminDomainService.AssignRule(params)
        return true;
    }

    static async RevokeRule(params: AdminParamsDto.RevokeRuleParams) {
        await AdminSchema.RevokeRule.validateAsync(params)
        await AdminDomainService.RevokeRule(params)
        return true;
    }
}