import { ShippingAddress } from "@domain/model/BaseClass/ShippingAddress";
import { ShippingAddressParamsDto, LogParamsDto } from "@domain/model/params";
import ShippingAddressDomainService from "@domain/service/ShippingAddressDomainService";
import * as ShippingAddressSchema from "helpers/JoiSchema/ShippingAddress"
import LogDomainService from "@domain/service/LogDomainService"
import { AppDataSource } from "@infrastructure/mysql/connection"

export default class ShippingAddressAppService {
    static async CreateShippingAddress(params: ShippingAddressParamsDto.CreateShippingAddressParams, logData: LogParamsDto.CreateLogParams) {
        await ShippingAddressSchema.CreateShippingAddress.validateAsync(params)

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            await ShippingAddressDomainService.CreateShippingAddressDomain(params)
            //Insert into log, to track user action.
            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()

            return true;
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }

    static async GetShippingAddressDetail(id: number, user_id: number) {
        await ShippingAddressSchema.ShippingAddressId.validateAsync(id)
        
        const shippingAddressDetail = await ShippingAddressDomainService.GetShippingAddressDetailDomain(id)
        
        if (user_id !== shippingAddressDetail.user_id) {
            throw new Error("This Shipping Address Doesn't Belong To You!")
        }
        return shippingAddressDetail
    }

    static async GetShippingAddressList(user_id: number) {
        await ShippingAddressSchema.ShippingAddressId.validateAsync(user_id)
        return await ShippingAddressDomainService.GetShippingAddressListDomain(user_id)
    }

    static async DeleteShippingAddress(id: number, user_id: number, logData: LogParamsDto.CreateLogParams) {
        await ShippingAddressSchema.ShippingAddressId.validateAsync(id)

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            const shippingAddressDetail = await ShippingAddressDomainService.GetShippingAddressDetailDomain(id)

            if (user_id !== shippingAddressDetail.user_id) {
                throw new Error("This Shipping Address Doesn't Belong To You!")
            }

            await ShippingAddressDomainService.DeleteShippingAddressDomain(id)
            
            //Insert into log, to track user action.
            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()

            return true;
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }

    static async UpdateShippingAddress(params: ShippingAddressParamsDto.UpdateShippingAddressParams, logData: LogParamsDto.CreateLogParams) {
        await ShippingAddressSchema.UpdateShippingAddress.validateAsync(params)
        const { id, address, city, country, postal_code, province, user_id } = params

        const existingAddress = await ShippingAddressDomainService.GetShippingAddressDetailDomain(id)

        if (user_id !== existingAddress.user_id) {
            throw new Error("This Shipping Address Doesn't Belong To You!")
        }

        const updateAddressData: Partial<ShippingAddress> = existingAddress

        if (address || postal_code || city || country || province) {
            if (address) updateAddressData.address = address;
            if (postal_code) updateAddressData.postal_code = postal_code;
            if (city) updateAddressData.city = city;
            if (country) updateAddressData.country = country;
            if (province) updateAddressData.province = province;
        }

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            await ShippingAddressDomainService.UpdateShippingAddressDomain({ ...updateAddressData, id, user_id })

            //Insert into log, to track user action.
            await LogDomainService.CreateLogDomain(logData, query_runner)
            await query_runner.commitTransaction()
            await query_runner.release()
            return true;
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }

        await ShippingAddressDomainService.UpdateShippingAddressDomain({ ...updateAddressData, id, user_id })

        //Insert into log, to track user action.
        await LogDomainService.CreateLogDomain(logData)
        return true;
    }

    static async GetUserShippingAddressByIdService(params: ShippingAddressParamsDto.GetUserShippingAddressByIdParams){
        await ShippingAddressSchema.GetUserShippingAddressById.validateAsync(params)

        const result = await ShippingAddressDomainService.GetUserShippingAddressByIdDomain(params.user_id)
        return result
    }
}