import { ShippingAddressParamsDto } from "@domain/model/params";
import { ShippingAddressResponseDto } from "@domain/model/response";
import { AppDataSource } from "@infrastructure/mysql/connection";
import { ResultSetHeader } from 'mysql2'
const db = AppDataSource;

export class ShippingAddressRepository {
    static async DBCreateShippingAddress(params: ShippingAddressParamsDto.CreateShippingAddressParams): Promise<ResultSetHeader> {
        const { user_id, address, city, country, postal_code, province } = params
        return await db.query<ResultSetHeader>(`
        INSERT INTO shipping_address(user_id, address, city, country, postal_code, province) 
        VALUES(?, ?, ?, ?, ?, ?)`,
            [user_id, address, city, country, postal_code, province])
    }

    static async DBGetShippingAddressDetail(id: number) {
        return await db.query<ShippingAddressResponseDto.ShippingAddressResponse[]>(`
        SELECT id, user_id, address, postal_code, city, province, country FROM shipping_address WHERE id = ?`, [id])
    }

    static async DBGetShippingAddressList(user_id: number): Promise<ShippingAddressResponseDto.ShippingAddressResponse[]> {
        return await db.query<ShippingAddressResponseDto.ShippingAddressResponse[]>(`
        SELECT id, user_id, address, postal_code, city, province, country FROM shipping_address WHERE user_id = ?`, [user_id])
    }

    static async DBDeleteShippingAddress(id: number): Promise<ResultSetHeader> {
        return await db.query<ResultSetHeader>(`DELETE FROM shipping_address WHERE id = ?`, [id])
    }

    static async DBUpdateShippingAddress(params: ShippingAddressParamsDto.UpdateShippingAddressParams) {
        const { id, address, city, country, postal_code, province } = params
        return await db.query<ResultSetHeader>(`
        UPDATE shipping_address SET address = ?, city = ?, country = ?, postal_code = ?, province = ? WHERE id = ?`, 
        [address, city, country, postal_code, province, id])
    }
}