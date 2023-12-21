import { FastifyRequest } from "fastify"
import AuthService from "@application/service/Auth"
import { UserRequestDto } from "@domain/model/request"
import moment from "moment"

export default class AuthController {
    static async Register(request: FastifyRequest) {
        try {
            const register = await AuthService.Register(request.body as UserRequestDto.RegisterRequest)
            return { message: register }
        } catch (error) {
            throw error
        }
    }

    static async Login(request: FastifyRequest) {
        try {
            const login = await AuthService.Login(request.body as UserRequestDto.LoginRequest, {
                user_id: 0,
                action: `Login`,
                ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                browser: request.headers["user-agent"],
                time: moment().unix(),
            })
            return { message: login }
        } catch (error) {
            throw error
        }
    }
}
