import AdminRepository from "@adapters/outbound/repository/AdminRepository"
import { ApiError, ResultNotFoundError } from "@domain/model/Error/Error"
import { AdminParamsDto } from "@domain/model/params"
import { RepoPaginationParams } from "key-pagination-sql"
import { QueryRunner } from "typeorm"

export default class AdminDomainService {
    static async GetAdminDataDomain(id: number) {
        const result = await AdminRepository.DBGetAdminData(id)
        if (result.length < 1) {
            throw new ResultNotFoundError("User not found")
        }
        return result[0]
    }

    static async SoftDeleteUserDomain(email: string, query_runner?: QueryRunner) {
        if (!query_runner?.isTransactionActive) {
            throw new ApiError("MUST_IN_TRANSACTION")
        }

        const result = await AdminRepository.DBSoftDeleteUser(email, query_runner)
        if (result.raw < 1) {
            throw new ApiError("Failed delete data")
        }
        return true
    }

    static async GetUserListDomain(params: RepoPaginationParams) {
        const result = await AdminRepository.DBGetUserList(params)
        if (result.length < 1) {
            throw new ResultNotFoundError("Empty User")
        }
        return result
    }

    static async GetUserDetailProfileDomain(email: string) {
        const result = await AdminRepository.DBGetUserDetailProfile(email)
        if (result.length < 1) {
            throw new ResultNotFoundError("Profile not found")
        }
        return result[0]
    }

    static async GetAdminList() {
        const adminList = await AdminRepository.DBGetAdminList()
        if (adminList.length < 1) {
            throw new ResultNotFoundError("No Admin Found!")
        }
        return adminList
    }

    static async GetRulesList() {
        const rulesList = await AdminRepository.DBGetRulesList()
        if (rulesList.length < 1) {
            throw new ResultNotFoundError("No Rules Found!")
        }
        return rulesList
    }

    static async CreateRule(rule: string, query_runner: QueryRunner) {
        if (!query_runner?.isTransactionActive) {
            throw new ApiError("MUST_IN_TRANSACTION")
        }

        const newRule = await AdminRepository.DBCreateRules(rule, query_runner)
        if (newRule.raw < 1) {
            throw new ApiError("Failed to Create New Rule")
        }
    }

    static async UpdateRule(params: AdminParamsDto.UpdateRuleParams, query_runner: QueryRunner) {
        if (!query_runner?.isTransactionActive) {
            throw new ApiError("MUST_IN_TRANSACTION")
        }

        const newRule = await AdminRepository.DBUpdateRule(params, query_runner)
        if (newRule.raw < 1) {
            throw new ApiError("Failed to Create New Rule")
        }
    }

    static async DeleteRule(rules_id: number, query_runner: QueryRunner) {
        if (!query_runner?.isTransactionActive) {
            throw new ApiError("MUST_IN_TRANSACTION")
        }

        const deleteRule = await AdminRepository.DBSoftDeleteRule(rules_id, query_runner)
        if (deleteRule.raw < 1) {
            throw new ApiError("Failed to Delete Rule")
        }
    }

    static async AssignRule(params: AdminParamsDto.AssignRuleParams, query_runner: QueryRunner) {
        if (!query_runner?.isTransactionActive) {
            throw new ApiError("MUST_IN_TRANSACTION")
        }

        const assignRule = await AdminRepository.DBAssignRule(params, query_runner)
        if (assignRule.raw < 1) {
            throw new ApiError("Failed to Assign Rule to Admin")
        }
    }

    static async RevokeRule(params: AdminParamsDto.RevokeRuleParams, query_runner: QueryRunner) {
        if (!query_runner?.isTransactionActive) {
            throw new ApiError("MUST_IN_TRANSACTION")
        }

        const revokeRule = await AdminRepository.DBRevokeRule(params, query_runner)
        if (revokeRule.raw < 1) {
            throw new ApiError("Failed to Revoke Rule From Admin")
        }
    }

    static async UserGroupRulesList(group_id: number) {
        const listOfRules = await AdminRepository.DBGetUserGroupRulesList(group_id)
        if (listOfRules.length < 1) {
            throw new ResultNotFoundError("No Group Found!")
        }
        return listOfRules[0]
    }

    static async ChangeUserPassDomain(userid: number, encryptPass: string, query_runner?: QueryRunner) {
        if (!query_runner?.isTransactionActive) {
            throw new ApiError("MUST_IN_TRANSACTION")
        }

        const result = await AdminRepository.DBChangeUserPass(userid, encryptPass, query_runner)
        if (result.raw < 1) {
            throw new ApiError("Failed change user password")
        }
        return true
    }

    static async GetTransactionListDomain(paginationParams: RepoPaginationParams) {
        const txList = await AdminRepository.DBGetTransactionList(paginationParams)
        if (txList.length < 1) {
            throw new ResultNotFoundError("No Transaction Found!")
        }
        return txList
    }

    static async GetUserShippingAddressDomain(paginationParams: RepoPaginationParams) {
        const addressList = await AdminRepository.DBGetUserShippingAddress(paginationParams)
        if (addressList.length < 1) {
            throw new ResultNotFoundError("No Address Found!")
        }
        return addressList
    }

    static async UpdateUserLevelDomain(user_id: number, level: number, query_runner: QueryRunner) {
        if (!query_runner?.isTransactionActive) {
            throw new ApiError("MUST_IN_TRANSACTION")
        }

        const result = await AdminRepository.DBUpdateUserLevel(user_id, level, query_runner)
        if (result.raw < 1) {
            throw new ApiError("Failed update user level")
        }
        return true
    }

    static async RestoreDeletedUserDomain(user_id: number, query_runner: QueryRunner) {
        if (!query_runner?.isTransactionActive) {
            throw new ApiError("MUST_IN_TRANSACTION")
        }

        const restore = await AdminRepository.DBRestoreDeletedUser(user_id, query_runner)
        if (restore.raw < 1) {
            throw new ApiError("Failed to restore user")
        }
    }

    static async CheckIsUserAliveDomain(id: number) {
        const isAlive = await AdminRepository.DBCheckIsUserAlive(id)
        if (isAlive.length < 1) {
            throw new ApiError("User is deleted")
        }
        return true
    }

    static async CheckExpiredAccountDomain() {
        return await AdminRepository.DBCheckExpiredAccount()
    }

    static async HardDeleteUserDomain(userId: number, query_runner?: QueryRunner) {
        if (query_runner && !query_runner?.isTransactionActive) {
            throw new ApiError("MUST_IN_TRANSACTION")
        }

        const deleteUser = await AdminRepository.DBHardDeleteUser(userId, query_runner)
        if (deleteUser.raw < 1) {
            throw new ApiError("Failed to delete user!")
        }
    }
}
