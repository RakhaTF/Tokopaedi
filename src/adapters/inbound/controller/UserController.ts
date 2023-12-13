import { FastifyRequest } from "fastify";
import UserAppService from "@application/service/User";
import { UserRequestDto } from "@domain/model/request";

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
            const updateUserProfile = await UserAppService.UpdateUserProfileService({
                id: jwt.id,
                email,
                name
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
            })

            const result = {message: changePassword}

            return result
        } catch (error) {
            throw error
        }
    }
}