import AdminRepository from "@adapters/outbound/repository/AdminRepository"
import { AdminParamsDto } from "@domain/model/params"
import { RepoPaginationParams } from "key-pagination-sql"
import { QueryRunner } from "typeorm"

export default class AdminDomainService {
    static async GetAdminDataDomain(id: number) {
        const result = await AdminRepository.DBGetAdminData(id)
        if (result.length < 1) {
            throw new Error("User not found")
        }
        return result[0]
    }

    static async SoftDeleteUserDomain(email: string, query_runner?: QueryRunner) {
        const result = await AdminRepository.DBSoftDeleteUser(email, query_runner)
        if (result.affectedRows < 1) {
            throw new Error("Failed delete data")
        }
        return true
    }

    static async GetUserListDomain(params: RepoPaginationParams) {
        const result = await AdminRepository.DBGetUserList(params)
        if (result.length < 1) {
            throw new Error("Empty User")
        }
        return result
    }

    static async GetUserDetailProfileDomain(email: string) {
        const result = await AdminRepository.DBGetUserDetailProfile(email)
        return result[0]
    }

    static async GetAdminList() {
        const adminList = await AdminRepository.DBGetAdminList()
        if (adminList.length < 1) {
            throw new Error("No Admin Found!")
        }
        return adminList
    }

    static async GetRulesList() {
        const rulesList = await AdminRepository.DBGetRulesList()
        if (rulesList.length < 1) {
            throw new Error("No Rules Found!")
        }
        return rulesList
    }

    static async CreateRule(rule: string, query_runner: QueryRunner) {
        const newRule = await AdminRepository.DBCreateRules(rule, query_runner)
        if (newRule.affectedRows < 1) {
            throw new Error("Failed to Create New Rule")
        }
    }

    static async UpdateRule(params: AdminParamsDto.UpdateRuleParams, query_runner: QueryRunner) {
        const newRule = await AdminRepository.DBUpdateRule(params, query_runner)
        if (newRule.affectedRows < 1) {
            throw new Error("Failed to Create New Rule")
        }
    }

    static async DeleteRule(rules_id: number, query_runner: QueryRunner) {
        const deleteRule = await AdminRepository.DBSoftDeleteRule(rules_id, query_runner)
        if (deleteRule.affectedRows < 1) {
            throw new Error("Failed to Delete Rule")
        }
    }

    static async AssignRule(params: AdminParamsDto.AssignRuleParams, query_runner: QueryRunner) {
        const assignRule = await AdminRepository.DBAssignRule(params, query_runner)
        if (assignRule.affectedRows < 1) {
            throw new Error("Failed to Assign Rule to Admin")
        }
    }

    static async RevokeRule(params: AdminParamsDto.RevokeRuleParams, query_runner: QueryRunner) {
        const revokeRule = await AdminRepository.DBRevokeRule(params, query_runner)
        if (revokeRule.affectedRows < 1) {
            throw new Error("Failed to Revoke Rule From Admin")
        }
    }

    static async UserGroupRulesList(group_id: number) {
        const listOfRules = await AdminRepository.DBGetUserGroupRulesList(group_id)
        if (listOfRules.length < 1) {
            throw new Error("No Group Found!")
        }
        return listOfRules[0]
    }

    static async ChangeUserPassDomain(userid: number, encryptPass: string, query_runner?: QueryRunner) {
        const result = await AdminRepository.DBChangeUserPass(userid, encryptPass, query_runner)
        if (result.affectedRows < 1) {
            throw Error("Failed change user password")
        }
        return true
    }

    static async GetTransactionListDomain(paginationParams: RepoPaginationParams) {
        return await AdminRepository.DBGetTransactionList(paginationParams)
    }

    static async GetUserShippingAddressDomain(paginationParams: RepoPaginationParams) {
        return await AdminRepository.DBGetUserShippingAddress(paginationParams)
    }

    static async UpdateUserLevelDomain(user_id: number, level: number, query_runner: QueryRunner) {
        const result = await AdminRepository.DBUpdateUserLevel(user_id, level, query_runner)
        if (result.affectedRows < 1) {
            throw Error("Failed update user level")
        }
        return true
    }

    static async RestoreDeletedUserDomain(user_id: number, query_runner: QueryRunner) {
        const restore = await AdminRepository.DBRestoreDeletedUser(user_id, query_runner)
        if (restore.affectedRows < 1) {
            throw new Error("Failed to restore user")
        }
    }

    static async CheckIsUserAliveDomain(id: number) {
        const isAlive = await AdminRepository.DBCheckIsUserAlive(id)
        if (isAlive.length < 1) {
            throw new Error("User is deleted")
        }
        return true
    }
}
