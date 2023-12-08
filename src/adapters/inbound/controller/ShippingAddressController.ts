import ShippingAddressAppService from "@application/service/ShippingAddress";
import { ShippingAddressRequestDto } from "@domain/model/request";
import { FastifyRequest } from "fastify";

export default class ShippingAddressController {
    static async CreateShippingAddress(request: FastifyRequest) {
        try {
            const { id } = request.user
            const data = request.body as ShippingAddressRequestDto.CreateShippingAddressRequest
            const result = await ShippingAddressAppService.CreateShippingAddress({ ...data, user_id: id })
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
            const result = await ShippingAddressAppService.DeleteShippingAddress(id, user.id)
            return { message: result }
        } catch (error) {
            throw error
        }

    }
    static async UpdateShippingAddress(request: FastifyRequest) {
        try {
            const { id } = request.user
            const updateData = request.body as ShippingAddressRequestDto.UpdateShippingAddressRequest
            const result = await ShippingAddressAppService.UpdateShippingAddress({ ...updateData, user_id: id })
            return { message: result }
        } catch (error) {
            throw error
        }
    }
}