import { FastifyRequest } from "fastify"
import AuthService from "@application/service/Auth"
import { UserRequestDto } from "@domain/model/request"
import moment from "moment"

export default class AuthController {
    static async Register(request: FastifyRequest) {
        const register = await AuthService.Register(request.body as UserRequestDto.RegisterRequest)
        return { message: register }
    }

    static async Login(request: FastifyRequest) {
        const login = await AuthService.Login(request.body as UserRequestDto.LoginRequest, {
            user_id: 0,
            action: `Login`,
            ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
            browser: request.headers["user-agent"],
            time: moment().unix(),
        })
        return { message: login }
    }

    static async VerifyEmail(request: FastifyRequest) {
        const { token } = request.query as { token: string }
        const verifyEmail = await AuthService.VerifyEmail(token, {
            user_id: 0,
            action: `Verify Email`,
            ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
            browser: request.headers["user-agent"],
            time: moment().unix(),
        })

        return { message: verifyEmail}
    }
}
