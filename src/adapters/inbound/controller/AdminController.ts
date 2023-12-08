import { FastifyRequest } from "fastify";
import AdminAppService from "@application/service/Admin";
import { AdminRequestDto } from "@domain/model/request";

export default class AdminController {
    static async GetAdminProfile(request: FastifyRequest){
        try {
            const jwt = request.user
            const getAdminProfile = await AdminAppService.GetAdminProfileService({
                id: jwt.id
            })

            const result = {message: getAdminProfile}

            return result
        } catch (error) {
            throw error
        }
    }

    static async CreateUser(request: FastifyRequest){
        try {
            const jwt = request.user
            const {name, email, password} = request.body as AdminRequestDto.CreateUserRequest
            const createUser = await AdminAppService.CreateUserService({
                id: jwt.id,
                name,
                email,
                password
            })

            const result = {message: createUser}

            return result
        } catch (error) {
            throw error
        }
    }

    static async UpdateProfileUser(request: FastifyRequest){
        try {
            const jwt = request.user
            const {userid, name, email} = request.body as AdminRequestDto.UpdateUserProfileRequest
            const updateUserProfile = await AdminAppService.UpdateProfileUser({
                id: jwt.id,
                userid,
                name,
                email
            })

            const result = {message : updateUserProfile}

            return result
        } catch (error) {
            throw error
        }
    }

    static async UpdateProfile(request: FastifyRequest){
        try {
            const jwt = request.user
            const {name, email} = request.body as AdminRequestDto.UpdateProfileRequest
            const updateProfile = await AdminAppService.UpdateProfileService({
                id: jwt.id,
                name,
                email
            })

            const result = {message : updateProfile}

            return result
        } catch (error) {
            throw error
        }
    }

    static async DeleteUser(request: FastifyRequest){
        try {
            const jwt = request.user
            const {email} = request.body as AdminRequestDto.DeleteUserRequest
            const deleteUser = await AdminAppService.DeleteUserService({
                id: jwt.id,
                email
            })

            const result = {message : deleteUser}

            return result
        } catch (error) {
            throw error
        }
    }

    static async GetUserList(){
        try {
            const getUserList = await AdminAppService.GetUserListService()

            const result = {message : getUserList}

            return result
        } catch (error) {
            throw error
        }
    }

    static async GetUserDetailProfile(request: FastifyRequest){
        try {
            const jwt = request.user
            const {email} = request.body as AdminRequestDto.GetUserDetailProfileRequest
            const getUserDetailProfile = await AdminAppService.GetUserDetailProfileService({id: jwt.id, email})

            const result = {message: getUserDetailProfile}
            return result
        } catch (error) {
            throw error
        }
    }
}