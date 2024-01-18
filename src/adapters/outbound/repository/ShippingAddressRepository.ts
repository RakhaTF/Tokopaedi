import { ShippingAddressParamsDto } from "@domain/model/params"
import { ShippingAddressResponseDto } from "@domain/model/response"
import { AppDataSource } from "@infrastructure/postgres/connection"
import { RepoPaginationParams } from "key-pagination-sql"
import { ResultSetHeader } from "mysql2"
import { QueryRunner } from "typeorm"
const db = AppDataSource

export class ShippingAddressRepository {
    static async DBCreateShippingAddress(params: ShippingAddressParamsDto.CreateShippingAddressParams, query_runner?: QueryRunner): Promise<ResultSetHeader> {
        const { user_id, address, city, country, postal_code, province } = params
        return await db.query<ResultSetHeader>(
            `
        INSERT INTO shipping_address(user_id, address, city, country, postal_code, province) 
        VALUES($1, $2, $3, $4, $5, $6)`,
            [user_id, address, city, country, postal_code, province],
            query_runner
        )
    }

    static async DBGetShippingAddressDetail(id: number) {
        return await db.query<ShippingAddressResponseDto.ShippingAddressResponse[]>(
            `
        SELECT id, user_id, address, postal_code, city, province, country FROM shipping_address WHERE id = $1`,
            [id]
        )
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

    static async DBSoftDeleteShippingAddress(id: number, query_runner?: QueryRunner): Promise<ResultSetHeader> {
        return await db.query<ResultSetHeader>(`UPDATE shipping_address SET is_deleted = true WHERE id = $1`, [id], query_runner)
    }

    static async DBUpdateShippingAddress(params: ShippingAddressParamsDto.UpdateShippingAddressParams, query_runner?: QueryRunner) {
        const { id, address, city, country, postal_code, province } = params
        return await db.query<ResultSetHeader>(
            `
        UPDATE shipping_address SET address = $1, city = $2, country = $3, postal_code = $4, province = $5 WHERE id = $6`,
            [address, city, country, postal_code, province, id],
            query_runner
        )
    }

    static async DBCheckIsAddressAlive(id: number) {
        return await db.query<{ id: number }[]>(`SELECT s.id FROM shipping_address s WHERE s.is_deleted != true AND s.id = $1`, [id])
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
        return await db.query<ResultSetHeader>(`DELETE from shipping_address WHERE id = $1`, [id])
    }
}
