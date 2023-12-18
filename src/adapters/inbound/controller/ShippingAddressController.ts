import ShippingAddressAppService from "@application/service/ShippingAddress";
import { ShippingAddressRequestDto } from "@domain/model/request";
import { FastifyRequest } from "fastify";
import moment from "moment";

export default class ShippingAddressController {
    static async CreateShippingAddress(request: FastifyRequest) {
        try {
            const { id } = request.user
            const data = request.body as ShippingAddressRequestDto.CreateShippingAddressRequest
            const result = await ShippingAddressAppService.CreateShippingAddress(
                { 
                    ...data, 
                    user_id: id 
                },
                {
                    user_id: id,
                    action: "Create Shipping Address",
                    ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                    browser: request.headers["user-agent"] as string,
                    time: moment().unix(),
                }
                )
            return { message: result }
        } catch (error) {
            throw error
        }
    }

    static async GetShippingAddressDetail(request: FastifyRequest) {
        try {
            const user = request.user
            const { id } = request.body as { id: number }
            const result = await ShippingAddressAppService.GetShippingAddressDetail(id, user.id)
            return { message: result }
        } catch (error) {
            throw error
        }
    }

    static async GetShippingAddressList(request: FastifyRequest) {
        try {
            const { id } = request.user
            const result = await ShippingAddressAppService.GetShippingAddressList(id)
            return { message: result }
        } catch (error) {
            throw error
        }
    }

    static async DeleteShippingAddress(request: FastifyRequest) {
        try {
            const user = request.user
            const { id } = request.body as { id: number }
            const result = await ShippingAddressAppService.DeleteShippingAddress(id, user.id,
                {
                    user_id: id,
                    action: "Delete Shipping Address",
                    ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                    browser: request.headers["user-agent"] as string,
                    time: moment().unix(),
                })
            return { message: result }
        } catch (error) {
            throw error
        }

    }
    static async UpdateShippingAddress(request: FastifyRequest) {
        try {
            const { id } = request.user
            const updateData = request.body as ShippingAddressRequestDto.UpdateShippingAddressRequest
            const result = await ShippingAddressAppService.UpdateShippingAddress(
                { 
                    ...updateData, 
                    user_id: id 
                },
                {
                    user_id: id,
                    action: "Update Shipping Address",
                    ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                    browser: request.headers["user-agent"] as string,
                    time: moment().unix(),
                }
                )
            return { message: result }
        } catch (error) {
            throw error
        }
    }
}