import { FastifyRequest } from "fastify";
import UserAppService from "@application/service/User";
import { CommonRequestDto, UserRequestDto } from "@domain/model/request";
import TransactionAppService from "@application/service/Transaction";
import moment from "moment";

export default class UserController {
    static async GetUserProfile(request: FastifyRequest){
        try {
            const jwt = request.user
            const getUserProfile = await UserAppService.GetUserProfileService({
                id: jwt.id
            })

            const result = {message : getUserProfile}
            return result
        } catch (error) {
            throw error
        }
    }

    static async UpdateUserProfile(request: FastifyRequest){
        try {
            const jwt = request.user
            const {email, name} = request.body as UserRequestDto.UpdateUserRequest
            const updateUserProfile = await UserAppService.UpdateUserProfileService(
                {
                    id: jwt.id,
                    email,
                    name
                },
                {
                    user_id: jwt.id,
                    action: "Update User Profile",
                    ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                    browser: request.headers["user-agent"] as string,
                    time: moment().unix(),
                })

            const result = {message : updateUserProfile}

            return result
        } catch (error) {
            throw error
        }
    }

    static async ChangePassword(request: FastifyRequest){
        try {
            const jwt = request.user
            const {oldPassword, newPassword} = request.body as UserRequestDto.ChangePasswordRequest
            const changePassword = await UserAppService.ChangePasswordService({
                id: jwt.id,
                oldPassword,
                newPassword
            },
            {
                user_id: jwt.id,
                action: "Change Password",
                ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                browser: request.headers["user-agent"] as string,
                time: moment().unix(),
            })

            const result = {message: changePassword}

            return result
        } catch (error) {
            throw error
        }
    }

    static async TransactionList(request: FastifyRequest) {
        try {
            const { id } = request.user
            const paginationRequest = request.body as CommonRequestDto.PaginationRequest
            const transactionList = await TransactionAppService.GetUserTransactionListByIdService({userid: id}, paginationRequest)
            return { message: transactionList }
        } catch (error) {
            throw error;
        }
    }

    static async DeleteTransaction(request: FastifyRequest) {
        try {
            const { id } = request.body as {id: number}
            const deleteTransaction = await TransactionAppService.DeleteTransaction(id,
                {
                    user_id: id,
                    action: `Delete Transaction ${id}`,
                    ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                    browser: request.headers["user-agent"] as string,
                    time: moment().unix(),
                })
            return { message: deleteTransaction }
        } catch (error) {
            throw error;
        }
    }
}