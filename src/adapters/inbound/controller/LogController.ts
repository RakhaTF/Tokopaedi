import LogAppService from "@application/service/Log"
import { CommonRequestDto } from "@domain/model/request"
import { FastifyRequest } from "fastify"

export default class LogController {
    static async GetSystemLog(request: FastifyRequest) {
        const paginationRequest = request.body as CommonRequestDto.PaginationRequest
        const logList = await LogAppService.GetSystemLog(paginationRequest)
        return { message: logList }
    }
}
