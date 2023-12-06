import { FastifyRequest } from "fastify";
import AuthService from "@application/service/Auth"
import { UserRequestDto } from "@domain/model/request";

export default class AuthController {
    static async Register(request: FastifyRequest) {
        try {
            const register = await AuthService.Register(request.body as UserRequestDto.RegisterRequest)
            return { message: register };
        } catch (error) {
            throw error
        }
    }

    static async Login(request: FastifyRequest) {
        try {
            const login = await AuthService.Login(request.body as UserRequestDto.LoginRequest)
            return { message: login };
        } catch (error) {
            throw error
        }
    }
}