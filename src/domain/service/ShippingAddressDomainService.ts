import { ShippingAddressRepository } from "@adapters/outbound/repository/ShippingAddressRepository"
import { ShippingAddressParamsDto } from "@domain/model/params"
import { RepoPaginationParams } from "key-pagination-sql"
import { QueryRunner } from "typeorm"

export default class ShippingAddressDomainService {
    static async CreateShippingAddressDomain(params: ShippingAddressParamsDto.CreateShippingAddressParams, query_runner?: QueryRunner) {
        const shippingAddress = await ShippingAddressRepository.DBCreateShippingAddress(params, query_runner)
        if (shippingAddress.raw < 1) {
            throw new Error("Create Shipping Address Failed!")
        }
    }

    static async GetShippingAddressDetailDomain(id: number) {
        const shippingAddress = await ShippingAddressRepository.DBGetShippingAddressDetail(id)
        if (shippingAddress.length < 1) {
            throw new Error("Shipping Address Not Found!")
        }
        return shippingAddress[0]
    }

    static async GetShippingAddressListDomain(user_id: number, paginationParams: RepoPaginationParams) {
        const shippingAddress = await ShippingAddressRepository.DBGetShippingAddressList(user_id, paginationParams)
        if (shippingAddress.length < 1) {
            throw new Error("Shipping Address Not Found!")
        }
        return shippingAddress
    }

    static async SoftDeleteShippingAddressDomain(id: number, query_runner?: QueryRunner) {
        const shippingAddress = await ShippingAddressRepository.DBSoftDeleteShippingAddress(id, query_runner)
        if (shippingAddress.affected < 1) {
            throw new Error("Failed to Delete Shipping Address")
        }
    }

    static async UpdateShippingAddressDomain(params: ShippingAddressParamsDto.UpdateShippingAddressParams, query_runner?: QueryRunner) {
        const shippingAddress = await ShippingAddressRepository.DBUpdateShippingAddress(params, query_runner)
        if (shippingAddress.affected < 1) {
            throw new Error("Failed to Update Shipping Address")
        }
    }

    static async GetUserShippingAddressByIdDomain(user_id: number, paginationParams: RepoPaginationParams) {
        const result = await ShippingAddressRepository.DBGetUserShippingAddressById(user_id, paginationParams)
        if (result.length < 1) {
            throw new Error("Shipping address not found")
        }
        return result
    }

    static async CheckIsShippingAddressAliveDomain(id: number) {
        const isAlive = await ShippingAddressRepository.DBCheckIsAddressAlive(Number(id))
        if (!isAlive) {
            throw new Error("Shipping Address is Deleted")
        }
        return true
    }

    static async HardDeleteShippingAddressDomain(id: number){
        const deleteAddress = await ShippingAddressRepository.DBHardDeleteShippingAddress(id)
        if(deleteAddress.affected < 1){
            throw new Error("Failed to delete shipping address")
        }
    }
}
