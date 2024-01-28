import { ShippingAddress } from "@domain/entity"
import { ShippingAddressParamsDto } from "@domain/model/params"
import { ShippingAddressResponseDto } from "@domain/model/response"
import { AppDataSource } from "@infrastructure/postgres/connection"
import { RepoPaginationParams } from "key-pagination-sql"
import { InsertResult, QueryRunner, UpdateResult } from "typeorm"
const db = AppDataSource

export class ShippingAddressRepository {
    static async DBCreateShippingAddress(params: ShippingAddressParamsDto.CreateShippingAddressParams, query_runner?: QueryRunner): Promise<InsertResult> {
        return await query_runner.manager.insert(ShippingAddress, params)
    }

    static async DBGetShippingAddressDetail(id: number) {
        return await db.manager.find(ShippingAddress, { where: { id } })
    }

    static async DBGetShippingAddressList(user_id: number, paginationParams: RepoPaginationParams): Promise<ShippingAddressResponseDto.ShippingAddressResponse[]> {
        const { limit, sort, whereClause } = paginationParams

        return await db.query<ShippingAddressResponseDto.ShippingAddressResponse[]>(
            `
        SELECT s.id, s.user_id, s.address, s.postal_code, s.city, s.province, s.country FROM shipping_address s ${whereClause} 
        AND s.user_id = $1 AND s.is_deleted != true 
        ORDER BY s.id ${sort}
        LIMIT $2`,
            [user_id, limit + 1]
        )
    }

    static async DBSoftDeleteShippingAddress(id: number, query_runner?: QueryRunner): Promise<UpdateResult> {
        return await query_runner.manager.update(ShippingAddress, { id }, { is_deleted: true })
    }

    static async DBUpdateShippingAddress(params: ShippingAddressParamsDto.UpdateShippingAddressParams, query_runner?: QueryRunner) {
        return await query_runner.manager.update(ShippingAddress, { id: params.id }, params)
    }

    static async DBCheckIsAddressAlive(id: number) {
        return await db.manager.findOne(ShippingAddress, {
            select: { id: true },
            where: { id, is_deleted: false }
        })
    }

    static async DBGetUserShippingAddressById(user_id: number, paginationParams: RepoPaginationParams): Promise<ShippingAddressResponseDto.GetUserShippingAddressById[]> {
        const { limit, sort, whereClause } = paginationParams

        return await db.query<ShippingAddressResponseDto.ShippingAddressResponse[]>(
            `
        SELECT s.id, s.user_id, s.address, s.postal_code, s.city, s.province, s.country, s.is_deleted FROM shipping_address s ${whereClause}
        AND user_id = $1
        ORDER BY s.id ${sort}
        LIMIT $2`,
            [user_id, limit + 1]
        )
    }

    static async DBHardDeleteShippingAddress(id: number) {
        return await db.manager.delete(ShippingAddress, { id })
    }
}
