import { AppDataSource } from "@infrastructure/mysql/connection";
import { AdminResponseDto } from "@domain/model/response";

const db = AppDataSource;

export default class AdminRepository {
    static async DBGetAdminData (id: number): Promise<AdminResponseDto.GetAdminDataResult[]>{
        const result = await db.query<AdminResponseDto.GetAdminDataResult[]>(`SELECT 
        u.id, u.name, u.email, u.level, u.created_at,
        GROUP_CONCAT(DISTINCT d.rules_id separator ',') as group_rules
        FROM user u
        LEFT JOIN user_group_rules d ON u.level = d.group_id
        WHERE u.id = ?
        GROUP BY u.id`, [id])

        return result
    }

    static async DBDeleteUser(email: string){
        const result = await db.query(`DELETE FROM user WHERE email = ?`, [email])
        console.log(result,"resss")
        return result
    }
}