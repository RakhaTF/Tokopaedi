import ShippingAddressAppService from "@application/service/ShippingAddress"
import { CommonRequestDto, ShippingAddressRequestDto } from "@domain/model/request"
import { FastifyRequest } from "fastify"
import moment from "moment"

export default class ShippingAddressController {
    static async CreateShippingAddress(request: FastifyRequest) {
        const { id } = request.user
        const data = request.body as ShippingAddressRequestDto.CreateShippingAddressRequest
        const result = await ShippingAddressAppService.CreateShippingAddress(
            {
                ...data,
                user_id: id,
            },
            {
                user_id: id,
                action: "Create Shipping Address",
                ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                browser: request.headers["user-agent"],
                time: moment().unix(),
            }
        )
        return { message: result }
    }

    static async GetShippingAddressDetail(request: FastifyRequest) {
        const user = request.user
        const { id } = request.body as { id: number }
        const result = await ShippingAddressAppService.GetShippingAddressDetail(id, user.id)
        return { message: result }
    }

    static async GetShippingAddressList(request: FastifyRequest) {
        const { id } = request.user
        const paginationRequest = request.body as CommonRequestDto.PaginationRequest
        const result = await ShippingAddressAppService.GetShippingAddressList(id, paginationRequest)
        return { message: result }
    }

    static async DeleteShippingAddress(request: FastifyRequest) {
        const user = request.user
        const { id } = request.body as { id: number }
        const result = await ShippingAddressAppService.SoftDeleteShippingAddress(id, user.id, {
            user_id: user.id,
            action: `Delete Shipping Address ${id}`,
            ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
            browser: request.headers["user-agent"],
            time: moment().unix(),
        })
        return { message: result }
    }
    static async UpdateShippingAddress(request: FastifyRequest) {
        const { id } = request.user
        const updateData = request.body as ShippingAddressRequestDto.UpdateShippingAddressRequest
        const result = await ShippingAddressAppService.UpdateShippingAddress(
            {
                ...updateData,
                user_id: id,
            },
            {
                user_id: id,
                action: `Update Shipping Address #${updateData.id}`,
                ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                browser: request.headers["user-agent"],
                time: moment().unix(),
            }
        )
        return { message: result }
    }
}
