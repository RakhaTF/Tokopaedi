import AdminRepository from "@adapters/outbound/repository/AdminRepository"
import { AdminParamsDto } from "@domain/model/params"
import { QueryRunner } from "typeorm"

export default class AdminDomainService {
    static async GetAdminDataDomain(id: number){
        const result = await AdminRepository.DBGetAdminData(id)
        if (result.length < 1) {
            throw new Error("User not found")
        }
        return result[0]
    }

    static async DeleteUserDomain(email: string){
        const result = await AdminRepository.DBDeleteUser(email)
        if (result.affectedRows < 1){
            throw new Error ("Failed delete data")
        }
        return true
    }

    static async GetUserListDomain(){
        const result = await AdminRepository.DBGetUserList()
        if (result.length < 1){
            throw new Error ("Empty User")
        }
        return result
    }

    static async GetUserDetailProfileDomain(email: string){
        const result = await AdminRepository.DBGetUserDetailProfile(email)
        return result[0]
    }

    static async GetAdminList() {
        const adminList = await AdminRepository.DBGetAdminList();
        if (adminList.length < 1) {
            throw new Error("No Admin Found!")
        }
        return adminList
    }

    static async GetRulesList() {
        const rulesList = await AdminRepository.DBGetRulesList();
        if (rulesList.length < 1) {
            throw new Error("No Rules Found!")
        }
        return rulesList
    }

    static async CreateRule(rule: string, query_runner: QueryRunner) {
        const newRule = await AdminRepository.DBCreateRules(rule, query_runner);
        if (newRule.affectedRows < 1) {
            throw new Error("Failed to Create New Rule")
        }
    }

    static async UpdateRule(params: AdminParamsDto.UpdateRuleParams, query_runner: QueryRunner) {
        const newRule = await AdminRepository.DBUpdateRule(params, query_runner);
        if (newRule.affectedRows < 1) {
            throw new Error("Failed to Create New Rule")
        }
    }

    static async DeleteRule(rules_id: number, query_runner: QueryRunner) {
        const deleteRule = await AdminRepository.DBDeleteRule(rules_id, query_runner);
        if (deleteRule.affectedRows < 1) {
            throw new Error("Failed to Delete Rule")
        }
    }

    static async AssignRule(params: AdminParamsDto.AssignRuleParams, query_runner: QueryRunner) {
        const assignRule = await AdminRepository.DBAssignRule(params, query_runner);
        if (assignRule.affectedRows < 1) {
            throw new Error("Failed to Assign Rule to Admin")
        }
    }

    static async RevokeRule(params: AdminParamsDto.RevokeRuleParams, query_runner: QueryRunner) {
        const revokeRule = await AdminRepository.DBRevokeRule(params, query_runner);
        if (revokeRule.affectedRows < 1) {
            throw new Error("Failed to Revoke Rule From Admin")
        }
    }

    static async UserGroupRulesList(group_id:number) {
        const listOfRules = await AdminRepository.DBGetUserGroupRulesList(group_id)
        if(listOfRules.length < 1 ){
            throw new Error("No Group Found!")
        }
        return listOfRules[0]
    }

    static async ChangeUserPassDomain(userid: number, encryptPass: string){
        const result = await AdminRepository.DBChangeUserPass(userid, encryptPass)
        if (result.affectedRows < 1){
            throw Error ("Failed change user password")
        }
        return true
    }

    static async GetTransactionListDomain(){
        return await AdminRepository.DBGetTransactionList()
    }

    static async GetUserShippingAddressDomain(){
        return await AdminRepository.DBGetUserShippingAddress()
    }

    static async UpdateUserLevelDomain(user_id: number, level: number){
        const result = await AdminRepository.DBUpdateUserLevel(user_id, level)
        if (result.affectedRows < 1){
            throw Error ("Failed update user level")
        }
        return true
    }
}
