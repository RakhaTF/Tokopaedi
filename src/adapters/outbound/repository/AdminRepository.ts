import { AppDataSource } from "@infrastructure/mysql/connection";
import { AdminResponseDto } from "@domain/model/response";
import { AdminParamsDto } from "@domain/model/params";
import { ResultSetHeader } from "mysql2";

const db = AppDataSource;

export default class AdminRepository {
    static async DBGetAdminData(id: number): Promise<AdminResponseDto.GetAdminDataResult[]> {
        const result = await db.query<AdminResponseDto.GetAdminDataResult[]>(`SELECT 
        u.id, u.name, u.email, u.level, u.created_at,
        GROUP_CONCAT(DISTINCT d.rules_id separator ',') as group_rules
        FROM user u
        LEFT JOIN user_group_rules d ON u.level = d.group_id
        WHERE u.id = ?
        GROUP BY u.id`, [id])

        return result
    }

    static async DBDeleteUser(email: string) {
        const result = await db.query(`DELETE FROM user WHERE email = ?`, [email])
        return result
    }

    static async DBGetUserList(): Promise<AdminResponseDto.GetUserListResponse[]> {
        const result = await db.query<AdminResponseDto.GetUserListResponse[]>(`
        SELECT u.id, u.name, u.email, u.created_at FROM user u WHERE u.level = 3`)
        return result
    }

    static async DBGetUserDetailProfile(email: string): Promise<AdminResponseDto.GetUserDetailProfileResponse[]> {
        const result = await db.query<AdminResponseDto.GetUserDetailProfileResponse[]>(`
        SELECT u.id, u.name, u.email, u.created_at FROM user u WHERE u.email = ?`, [email])

        return result
    }

    static async DBGetAdminList() {
        return await db.query<AdminResponseDto.GetAdminListQueryResult[]>(`
        SELECT u.name, 
            GROUP_CONCAT(ur.rules SEPARATOR ",") AS rights, 
            GROUP_CONCAT(ur.rules_id SEPARATOR ",") AS rules_id 
        FROM user u
        JOIN user_groups ug
            ON u.level = ug.level_id
        JOIN user_group_rules ugr
            ON ugr.group_id = ug.level_id
        JOIN user_rules ur
            ON ugr.rules_id = ur.rules_id
        WHERE u.level <> 3
        GROUP BY name;
        `)
    }

    static async DBCreateRules(rules: string) {
        return await db.query<ResultSetHeader>(`INSERT INTO user_rules(rules) VALUES(?)`, [rules])
    }

    static async DBGetRulesList() {
        return await db.query<AdminResponseDto.GetRulesListResponse[]>(`SELECT rules_id, rules FROM user_rules;`)
    }

    static async DBUpdateRule({ rule, rules_id }: AdminParamsDto.UpdateRuleParams) {
        return await db.query<ResultSetHeader>(`UPDATE user_rules SET rules = ? WHERE rules_id = ?`, [rule, rules_id])
    }

    static async DBDeleteRule(rules_id: number) {
        return await db.query<ResultSetHeader>(`DELETE FROM user_rules WHERE rules_id = ?`, [rules_id])
    }

    static async DBAssignRule({ group_id, rules_id }: AdminParamsDto.AssignRuleParams) {
        return await db.query<ResultSetHeader>(`INSERT INTO user_group_rules(group_id, rules_id) VALUES(?, ?)`, [group_id, rules_id])
    }

    static async DBRevokeRule({ group_id, rules_id }: AdminParamsDto.RevokeRuleParams) {
        return await db.query<ResultSetHeader>(`DELETE FROM user_group_rules WHERE group_id = ? AND rules_id = ?`, [group_id, rules_id])
    }

    static async DBGetUserGroupRulesList(group_id: number) {
        return db.query<AdminResponseDto.GetUserGroupRulesResponse[]>(`
        SELECT group_id, GROUP_CONCAT(rules_id SEPARATOR ",") AS list_of_rules 
        FROM user_group_rules
        WHERE group_id = ?
        GROUP BY 1`, [group_id])
    }

    static async DBChangeUserPass(userid: number, encryptPass: string){
        return db.query(`UPDATE user SET password = ? WHERE id = ?`, [encryptPass, userid])
    }

    static async DBGetTransactionList(): Promise<AdminResponseDto.GetTransactionListResponse[]>{
        return db.query<AdminResponseDto.GetTransactionListResponse[]>(
        `SELECT t.id, t.user_id, t.payment_method, t.items_price, t.shipping_price, t.total_price,
		    t.shipping_address_id, t.is_paid, t.paid_at, t.created_at, 
		    t.updated_at FROM transaction t`)
    }

    static async DBGetUserShippingAddress(): Promise<AdminResponseDto.GetUserShippingAddressResponse[]>{
        return db.query<AdminResponseDto.GetUserShippingAddressResponse[]>(
            `SELECT sa.id, sa.user_id, sa.address, sa.postal_code, sa.city, sa.province, sa.country
            FROM shipping_address sa`
        )
    }

    static async DBUpdateUserLevel(user_id: number, level: number){
        return db.query(`UPDATE user SET LEVEL = ? WHERE id = ?`, [level, user_id])
    }
}