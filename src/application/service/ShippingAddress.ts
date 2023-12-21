import { ShippingAddress } from "@domain/model/BaseClass/ShippingAddress"
import { ShippingAddressParamsDto, LogParamsDto } from "@domain/model/params"
import ShippingAddressDomainService from "@domain/service/ShippingAddressDomainService"
import * as ShippingAddressSchema from "helpers/JoiSchema/ShippingAddress"
import LogDomainService from "@domain/service/LogDomainService"
import { AppDataSource } from "@infrastructure/mysql/connection"
import { CommonRequestDto } from "@domain/model/request"
import * as CommonSchema from "helpers/JoiSchema/Common"
import unicorn from "format-unicorn/safe"
import { GenerateWhereClause, Paginate } from "key-pagination-sql"

export default class ShippingAddressAppService {
    static async CreateShippingAddress(params: ShippingAddressParamsDto.CreateShippingAddressParams, logData: LogParamsDto.CreateLogParams) {
        await ShippingAddressSchema.CreateShippingAddress.validateAsync(params)

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            await ShippingAddressDomainService.CreateShippingAddressDomain(params, query_runner)
            //Insert into log, to track user action.
            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()

            return true
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

    static async GetShippingAddressList(user_id: number, paginationParams: CommonRequestDto.PaginationRequest) {
        await CommonSchema.Pagination.validateAsync(paginationParams)
        const { lastId = 0, limit = 100, search, sort = "ASC" } = paginationParams

        /*
        search filter, to convert filter field into sql string
        e.g: ({payment} = "Credit Card" AND {items_price} > 1000) will turn into ((t.payment_method = "Credit Card" AND t.items_price > 1000))
        every field name need to be inside {}
        */
        let searchFilter = search || ""
        searchFilter = unicorn(searchFilter, {
            id: "s.id",
            user_id: "s.user_id",
            city: "s.city",
        })

        //Generate whereClause
        const whereClause = GenerateWhereClause({ lastId, searchFilter, sort, tableAlias: "s", tablePK: "id" })
        const shippingList = await ShippingAddressDomainService.GetShippingAddressListDomain(user_id, { whereClause, limit: Number(limit), sort })

        //Generate pagination
        const result = Paginate({ data: shippingList, limit })
        return result
    }

    static async SoftDeleteShippingAddress(id: number, user_id: number, logData: LogParamsDto.CreateLogParams) {
        await ShippingAddressSchema.ShippingAddressId.validateAsync(id)

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            const shippingAddressDetail = await ShippingAddressDomainService.GetShippingAddressDetailDomain(id, query_runner)

            if (user_id !== shippingAddressDetail.user_id) {
                throw new Error("This Shipping Address Doesn't Belong To You!")
            }

            await ShippingAddressDomainService.SoftDeleteShippingAddressDomain(id, query_runner)

            //Insert into log, to track user action.
            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()

            return true
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }

    static async UpdateShippingAddress(params: ShippingAddressParamsDto.UpdateShippingAddressParams, logData: LogParamsDto.CreateLogParams) {
        await ShippingAddressSchema.UpdateShippingAddress.validateAsync(params)
        const { id, address, city, country, postal_code, province, user_id } = params

        //additional checking to prevent mutate deleted data.
        await ShippingAddressDomainService.CheckIsShippingAddressAliveDomain(id)

        const existingAddress = await ShippingAddressDomainService.GetShippingAddressDetailDomain(id)

        if (user_id !== existingAddress.user_id) {
            throw new Error("This Shipping Address Doesn't Belong To You!")
        }

        const updateAddressData: Partial<ShippingAddress> = existingAddress

        if (address || postal_code || city || country || province) {
            if (address) updateAddressData.address = address
            if (postal_code) updateAddressData.postal_code = postal_code
            if (city) updateAddressData.city = city
            if (country) updateAddressData.country = country
            if (province) updateAddressData.province = province
        }

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            await ShippingAddressDomainService.UpdateShippingAddressDomain({ ...updateAddressData, id, user_id }, query_runner)

            //Insert into log, to track user action.
            await LogDomainService.CreateLogDomain(logData, query_runner)
            await query_runner.commitTransaction()
            await query_runner.release()
            return true
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }

    static async GetUserShippingAddressByIdService(user_id: number, paginationParams: CommonRequestDto.PaginationRequest) {
        await CommonSchema.Pagination.validateAsync(paginationParams)
        const { lastId = 0, limit = 100, search, sort = "ASC" } = paginationParams

        /*
        search filter, to convert filter field into sql string
        e.g: ({payment} = "Credit Card" AND {items_price} > 1000) will turn into ((t.payment_method = "Credit Card" AND t.items_price > 1000))
        every field name need to be inside {}
        */
        let searchFilter = search || ""
        searchFilter = unicorn(searchFilter, {
            id: "s.id",
            city: "s.city",
        })

        //Generate whereClause
        const whereClause = GenerateWhereClause({ lastId, searchFilter, sort, tableAlias: "s", tablePK: "id" })

        const getUserShippingById = await ShippingAddressDomainService.GetUserShippingAddressByIdDomain(user_id, { whereClause, limit: Number(limit), sort })
        const result = Paginate({ data: getUserShippingById, limit })
        return result
    }
}
