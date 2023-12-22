import { FastifyRequest } from "fastify"
import AdminAppService from "@application/service/Admin"
import TransactionAppService from "@application/service/Transaction"
import { AdminRequestDto, CommonRequestDto, ShippingAddressRequestDto, TransactionRequestDto } from "@domain/model/request"
import ShippingAddressAppService from "@application/service/ShippingAddress"
import moment from "moment"

export default class AdminController {
    static async GetAdminProfile(request: FastifyRequest) {
        const jwt = request.user
        const getAdminProfile = await AdminAppService.GetAdminProfileService({
            id: jwt.id,
        })

        const result = { message: getAdminProfile }

        return result
    }

    static async CreateUser(request: FastifyRequest) {
        const jwt = request.user
        const { name, email, password } = request.body as AdminRequestDto.CreateUserRequest
        const createUser = await AdminAppService.CreateUserService(
            {
                id: jwt.id,
                name,
                email,
                password,
            },
            {
                user_id: jwt.id,
                action: "Create User",
                ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                browser: request.headers["user-agent"],
                time: moment().unix(),
            }
        )

        const result = { message: createUser }

        return result
    }

    static async UpdateProfileUser(request: FastifyRequest) {
        const jwt = request.user
        const { userid, name, email } = request.body as AdminRequestDto.UpdateUserProfileRequest
        const updateUserProfile = await AdminAppService.UpdateProfileUser(
            {
                id: jwt.id,
                userid,
                name,
                email,
            },
            {
                user_id: jwt.id,
                action: `Update Profile User ${userid}`,
                ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                browser: request.headers["user-agent"],
                time: moment().unix(),
            }
        )

        const result = { message: updateUserProfile }

        return result
    }

    static async UpdateProfile(request: FastifyRequest) {
        const jwt = request.user
        const { name, email } = request.body as AdminRequestDto.UpdateProfileRequest
        const updateProfile = await AdminAppService.UpdateProfileService(
            {
                id: jwt.id,
                name,
                email,
            },
            {
                user_id: jwt.id,
                action: `Update Profile`,
                ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                browser: request.headers["user-agent"],
                time: moment().unix(),
            }
        )

        const result = { message: updateProfile }

        return result
    }

    static async SoftDeleteUser(request: FastifyRequest) {
        const jwt = request.user
        const { email } = request.body as AdminRequestDto.DeleteUserRequest
        const deleteUser = await AdminAppService.SoftDeleteUserService(
            {
                id: jwt.id,
                email,
            },
            {
                user_id: jwt.id,
                action: "Delete User",
                ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                browser: request.headers["user-agent"],
                time: moment().unix(),
            }
        )

        const result = { message: deleteUser }

        return result
    }

    static async GetUserList(request: FastifyRequest) {
        const paginationRequest = request.body as CommonRequestDto.PaginationRequest
        const getUserList = await AdminAppService.GetUserListService(paginationRequest)

        const result = { message: getUserList }

        return result
    }

    static async GetUserDetailProfile(request: FastifyRequest) {
        const jwt = request.user
        const { email } = request.body as AdminRequestDto.GetUserDetailProfileRequest
        const getUserDetailProfile = await AdminAppService.GetUserDetailProfileService({ id: jwt.id, email })

        const result = { message: getUserDetailProfile }
        return result
    }

    static async GetAdminList() {
        const admin = await AdminAppService.GetAdminListService()
        return { message: admin }
    }

    static async GetRulesList() {
        const rules = await AdminAppService.GetRulesListService()
        return { message: rules }
    }

    static async CreateRule(request: FastifyRequest) {
        const { id } = request.user
        const { rule } = request.body as { rule: string }
        const createRule = await AdminAppService.CreateRules(rule, {
            user_id: id,
            action: `Create Rule ${rule}`,
            ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
            browser: request.headers["user-agent"],
            time: moment().unix(),
        })
        return { message: createRule }
    }

    static async UpdateRule(request: FastifyRequest) {
        const { id } = request.user
        const updateRuleParams = request.body as AdminRequestDto.UpdateRuleRequest
        const updateRule = await AdminAppService.UpdateRule(updateRuleParams, {
            user_id: id,
            action: `Update Rule #${updateRuleParams.rules_id}`,
            ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
            browser: request.headers["user-agent"],
            time: moment().unix(),
        })
        return { message: updateRule }
    }

    static async DeleteRule(request: FastifyRequest) {
        const { id } = request.user
        const { rules_id } = request.body as { rules_id: number }
        const deleteRule = await AdminAppService.DeleteRule(rules_id, {
            user_id: id,
            action: `Delete Rule #${rules_id}`,
            ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
            browser: request.headers["user-agent"],
            time: moment().unix(),
        })
        return { message: deleteRule }
    }

    static async AssignRule(request: FastifyRequest) {
        const { id } = request.user
        const assignRuleParams = request.body as AdminRequestDto.AssignRuleRequest
        const assignRule = await AdminAppService.AssignRule(assignRuleParams, {
            user_id: id,
            action: `Assign Rule #${assignRuleParams.rules_id} To User Group #${assignRuleParams.group_id}`,
            ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
            browser: request.headers["user-agent"],
            time: moment().unix(),
        })
        return { message: assignRule }
    }

    static async RevokeRule(request: FastifyRequest) {
        const { id } = request.user
        const revokeRuleParams = request.body as AdminRequestDto.RevokeRuleRequest
        const RevokeRule = await AdminAppService.RevokeRule(revokeRuleParams, {
            user_id: id,
            action: `Revoke Rule #${revokeRuleParams.rules_id} From User Group #${revokeRuleParams.group_id}`,
            ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
            browser: request.headers["user-agent"],
            time: moment().unix(),
        })
        return { message: RevokeRule }
    }

    static async ChangeUserPass(request: FastifyRequest) {
        const { userid, password, confirmPassword } = request.body as AdminRequestDto.ChangeUserPassRequest
        const changeUserPass = await AdminAppService.ChangeUserPass(
            {
                userid,
                password,
                confirmPassword,
            },
            {
                user_id: userid,
                action: `Change User Password ${userid}`,
                ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                browser: request.headers["user-agent"],
                time: moment().unix(),
            }
        )

        const result = { message: changeUserPass }

        return result
    }

    static async ChangePass(request: FastifyRequest) {
        const { id } = request.user
        const { oldPassword, newPassword } = request.body as AdminRequestDto.ChangePasswordRequest
        const changePassword = await AdminAppService.ChangePasswordService(
            {
                id,
                oldPassword,
                newPassword,
            },
            {
                user_id: id,
                action: `Change Password`,
                ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                browser: request.headers["user-agent"],
                time: moment().unix(),
            }
        )

        const result = { message: changePassword }

        return result
    }

    static async GetTransactionList(request: FastifyRequest) {
        const paginationRequest = request.body as CommonRequestDto.PaginationRequest
        const getTransactionList = await AdminAppService.TransactionListService(paginationRequest)

        const result = { message: getTransactionList }
        return result
    }

    static async GetUserTransactionListById(request: FastifyRequest) {
        const { userid } = request.body as TransactionRequestDto.GetUserTransactionListByIdRequest
        const paginationRequest = request.body as CommonRequestDto.PaginationRequest
        const getUserTransactionListById = await TransactionAppService.GetUserTransactionListByIdService(
            {
                userid,
            },
            paginationRequest
        )

        const result = { message: getUserTransactionListById }
        return result
    }

    static async UpdateDeliveryStatus(request: FastifyRequest) {
        const { id } = request.user
        const { is_delivered, status, transaction_id } = request.body as TransactionRequestDto.UpdateDeliveryStatusRequest
        const updateDeliveryStatus = await TransactionAppService.UpdateDeliveryStatus(
            { is_delivered, status, transaction_id },
            {
                user_id: id,
                action: `Update Transaction Delivery Status ${transaction_id}`,
                ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                browser: request.headers["user-agent"],
                time: moment().unix(),
            }
        )
        return { message: updateDeliveryStatus }
    }

    static async ApproveTransaction(request: FastifyRequest) {
        const { id } = request.user
        const { transaction_id } = request.body as TransactionRequestDto.UpdateTransactionStatusRequest
        const approveTransaction = await TransactionAppService.ApproveTransaction(
            { transaction_id },
            {
                user_id: id,
                action: `Approve Transaction Status ${transaction_id}`,
                ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                browser: request.headers["user-agent"],
                time: moment().unix(),
            }   
        )
        return { message: approveTransaction }
    }

    static async RejectTransaction(request: FastifyRequest) {
        const { id } = request.user
        const { transaction_id } = request.body as TransactionRequestDto.UpdateTransactionStatusRequest
        const rejectTransaction = await TransactionAppService.RejectTransaction(
            { transaction_id },
            {
                user_id: id,
                action: `Reject Transaction Status ${transaction_id}`,
                ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                browser: request.headers["user-agent"],
                time: moment().unix(),
            }
        )
        return { message: rejectTransaction }
    }

    static async GetUserShippingAddress(request: FastifyRequest) {
        const paginationRequest = request.body as CommonRequestDto.PaginationRequest
        const getUserShippingAddress = await AdminAppService.GetUserShippingAddressService(paginationRequest)
        const result = { message: getUserShippingAddress }

        return result
    }

    static async GetUserShippingAddressById(request: FastifyRequest) {
        const paginationRequest = request.body as CommonRequestDto.PaginationRequest
        const { user_id } = request.body as ShippingAddressRequestDto.GetUserShippingAddressByIdRequest
        const getUserShippingAddressById = await ShippingAddressAppService.GetUserShippingAddressByIdService(user_id, paginationRequest)

        const result = { message: getUserShippingAddressById }
        return result
    }

    static async GetUserTransactionDetail(request: FastifyRequest) {
        const { id } = request.body as { id: number }
        const transactionDetail = await TransactionAppService.GetTransactionDetail(id)
        return { message: transactionDetail }
    }

    static async UpdateUserLevel(request: FastifyRequest) {
        const { id } = request.user
        const { user_id, level } = request.body as AdminRequestDto.UpdateUserLevelRequest
        const updateUserLevel = await AdminAppService.UpdateUserLevelService(
            {
                user_id,
                level,
            },
            {
                user_id: id,
                action: `Update User #${user_id} Level ${level}`,
                ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                browser: request.headers["user-agent"],
                time: moment().unix(),
            }
        )

        const result = { message: updateUserLevel }
        return result
    }

    static async DeleteUserTransaction(request: FastifyRequest) {
        const { id } = request.user
        const { transaction_id } = request.body as { transaction_id: number }
        const deleteTransaction = await TransactionAppService.DeleteUserTransaction(transaction_id, {
            user_id: id,
            action: `Delete Transaction ${transaction_id}`,
            ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
            browser: request.headers["user-agent"],
            time: moment().unix(),
        })

        const result = { message: deleteTransaction }
        return result
    }

    static async RestoreDeletedUser(request: FastifyRequest) {
        const { id } = request.user
        const { user_id } = request.body as { user_id: number }
        const deleteTransaction = await AdminAppService.RestoreDeletedUserService(user_id, {
            user_id: id,
            action: `Restore Deleted User #${user_id}`,
            ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
            browser: request.headers["user-agent"],
            time: moment().unix(),
        })

        const result = { message: deleteTransaction }
        return result
    }
}
