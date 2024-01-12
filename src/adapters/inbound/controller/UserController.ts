import { FastifyRequest } from "fastify"
import UserAppService from "@application/service/User"
import { CommonRequestDto, UserRequestDto } from "@domain/model/request"
import TransactionAppService from "@application/service/Transaction"
import moment from "moment"

export default class UserController {
    static async GetUserProfile(request: FastifyRequest) {
        const {id} = request.user
        const getUserProfile = await UserAppService.GetUserProfileService(id)

        const result = { message: getUserProfile }
        return result
    }

    static async UpdateUserProfile(request: FastifyRequest) {
        const jwt = request.user
        const { email, name } = request.body as UserRequestDto.UpdateUserRequest
        const updateUserProfile = await UserAppService.UpdateUserProfileService(
            {
                id: jwt.id,
                email,
                name,
            },
            {
                user_id: jwt.id,
                action: "Update User Profile",
                ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                browser: request.headers["user-agent"],
                time: moment().unix(),
            }
        )

        const result = { message: updateUserProfile }

        return result
    }

    static async ChangePassword(request: FastifyRequest) {
        const jwt = request.user
        const { oldPassword, newPassword } = request.body as UserRequestDto.ChangePasswordRequest
        const changePassword = await UserAppService.ChangePasswordService(
            {
                id: jwt.id,
                oldPassword,
                newPassword,
            },
            {
                user_id: jwt.id,
                action: "Change Password",
                ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                browser: request.headers["user-agent"],
                time: moment().unix(),
            }
        )

        const result = { message: changePassword }

        return result
    }

    static async TransactionList(request: FastifyRequest) {
        const { id } = request.user
        const paginationRequest = request.body as CommonRequestDto.PaginationRequest
        const transactionList = await TransactionAppService.GetUserTransactionListByIdService({ userid: id }, paginationRequest)
        return { message: transactionList }
    }

    static async DeleteTransaction(request: FastifyRequest) {
        const { id } = request.body as { id: number }
        const deleteTransaction = await TransactionAppService.SoftDeleteTransaction(id, {
            user_id: id,
            action: `Delete Transaction ${id}`,
            ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
            browser: request.headers["user-agent"],
            time: moment().unix(),
        })
        return { message: deleteTransaction }
    }
}
