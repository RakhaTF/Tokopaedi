import { FastifyRequest } from "fastify";
import * as AuthService from "@application/service/Auth"
import * as UserDto from "@domain/model/User"

export default class AuthController {
    static async Register(request: FastifyRequest) {
        try {
            const register = await AuthService.Register(request.body as UserDto.CreateUserRequest)
            return { message: register };
        } catch (error) {
            throw error
        }
    }

    static async Login(request: FastifyRequest) {
        try {
            const login = await AuthService.Login(request.body as UserDto.LoginRequest)
            return { message: "Login Success", data: login };
        } catch (error) {
            throw error
        }
    }
}