import { AppDataSource } from "@infrastructure/postgres/connection"
import { AdminResponseDto } from "@domain/model/response"
import { AdminParamsDto } from "@domain/model/params"
import { QueryRunner } from "typeorm"
import { RepoPaginationParams } from "key-pagination-sql"

const db = AppDataSource

export default class AdminRepository {
    static async DBGetAdminData(id: number): Promise<AdminResponseDto.GetAdminDataResult[]> {
        const result = await db.manager.createQueryBuilder()
            .select([
                "u.id",
                "u.name",
                "u.email",
                "u.level",
                "u.created_at",
                "string_agg(DISTINCT d.rules_id::text, ',') as group_rules"
            ])
            .from("users", "u")
            .leftJoin("user_group_rules", "d", "u.level = d.group_id")
            .where("u.id = :id", { id })
            .groupBy("u.id")
            .getRawMany();

        return result
    }

    static async DBSoftDeleteUser(email: string, query_runner?: QueryRunner) {
        const result = await db.query(`UPDATE users SET is_deleted = true WHERE email = $1`, [email], query_runner)
        return result
    }

    static async DBGetUserList(paginationParams: RepoPaginationParams): Promise<AdminResponseDto.GetUserListResponse[]> {
        const { limit, sort, whereClause } = paginationParams

        const result = await db.query<AdminResponseDto.GetUserListResponse[]>(
            `
        SELECT 
        u.id, u.name, u.email, u.created_at,
        CASE
            WHEN u.is_deleted = false
                THEN 'Active'
            WHEN u.is_deleted = true
                THEN 'Deleted'
        END as is_deleted
        FROM users u 
        ${whereClause}
        AND u.level = 3
        ORDER BY u.id ${sort}
        LIMIT $1`,
            [limit + 1]
        )
        return result
    }

    static async DBGetUserDetailProfile(email: string): Promise<AdminResponseDto.GetUserDetailProfileResponse[]> {
        const result = await db.query<AdminResponseDto.GetUserDetailProfileResponse[]>(
            `
        SELECT u.id, u.name, u.email, u.created_at FROM users u WHERE u.email = $1`,
            [email]
        )

        return result
    }

    static async DBGetAdminList() {
        return await db.query<AdminResponseDto.GetAdminListQueryResult[]>(`
        SELECT u.name, 
            GROUP_CONCAT(ur.rules SEPARATOR ",") AS rights, 
            GROUP_CONCAT(ur.rules_id SEPARATOR ",") AS rules_id 
        FROM users u
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

    static async DBCreateRules(rules: string, query_runner: QueryRunner) {
        if (query_runner && !query_runner.isTransactionActive) {
            throw new Error("Must in Transaction")
        }
        return await db.query(`INSERT INTO user_rules(rules) VALUES($1)`, [rules], query_runner)
    }

    static async DBGetRulesList() {
        return await db.query<AdminResponseDto.GetRulesListResponse[]>(`SELECT rules_id, rules FROM user_rules;`)
    }

    static async DBUpdateRule({ rule, rules_id }: AdminParamsDto.UpdateRuleParams, query_runner: QueryRunner) {
        if (query_runner && !query_runner.isTransactionActive) {
            throw new Error("Must in Transaction")
        }
        return await db.query(`UPDATE user_rules SET rules = $1 WHERE rules_id = $2`, [rule, rules_id], query_runner)
    }

    static async DBSoftDeleteRule(rules_id: number, query_runner: QueryRunner) {
        if (query_runner && !query_runner.isTransactionActive) {
            throw new Error("Must in Transaction")
        }
        return await db.query(`DELETE FROM user_rules WHERE rules_id = $1`, [rules_id], query_runner)
    }

    static async DBAssignRule({ group_id, rules_id }: AdminParamsDto.AssignRuleParams, query_runner: QueryRunner) {
        if (query_runner && !query_runner.isTransactionActive) {
            throw new Error("Must in Transaction")
        }
        return await db.query(`INSERT INTO user_group_rules(group_id, rules_id) VALUES($1, $2)`, [group_id, rules_id], query_runner)
    }

    static async DBRevokeRule({ group_id, rules_id }: AdminParamsDto.RevokeRuleParams, query_runner: QueryRunner) {
        if (query_runner && !query_runner.isTransactionActive) {
            throw new Error("Must in Transaction")
        }
        return await db.query(`DELETE FROM user_group_rules WHERE group_id = $1 AND rules_id = $2`, [group_id, rules_id], query_runner)
    }

    static async DBGetUserGroupRulesList(group_id: number) {
        return db.query<AdminResponseDto.GetUserGroupRulesResponse[]>(
            `
        SELECT group_id, GROUP_CONCAT(rules_id SEPARATOR ",") AS list_of_rules 
        FROM user_group_rules
        WHERE group_id = $1
        GROUP BY 1`,
            [group_id]
        )
    }

    static async DBChangeUserPass(userid: number, encryptPass: string, query_runner?: QueryRunner) {
        return db.query(`UPDATE users SET password = $1 WHERE id = $2`, [encryptPass, userid], query_runner)
    }

    static async DBGetTransactionList(paginationParams: RepoPaginationParams): Promise<AdminResponseDto.GetTransactionListResponse[]> {
        const { limit, sort, whereClause } = paginationParams

        return db.query<AdminResponseDto.GetTransactionListResponse[]>(
            `SELECT t.id,
            t.user_id,
            t.payment_method,
            t.items_price,
            t.shipping_price,
            t.total_price,
            t.shipping_address_id,
            t.is_paid,
            t.paid_at,
            t.created_at,
            t.updated_at
        FROM TRANSACTION t
        ${whereClause}
        ORDER BY t.id ${sort}
        LIMIT $1`,
            [limit + 1]
        )
    }

    static async DBGetUserShippingAddress(paginationParams: RepoPaginationParams): Promise<AdminResponseDto.GetUserShippingAddressResponse[]> {
        const { limit, sort, whereClause } = paginationParams

        return db.query<AdminResponseDto.GetUserShippingAddressResponse[]>(
            `SELECT sa.id, sa.user_id, sa.address, sa.postal_code, sa.city, sa.province, sa.country
            FROM shipping_address sa ${whereClause}
            ORDER BY sa.id ${sort}
            LIMIT $1`,
            [limit + 1]
        )
    }

    static async DBUpdateUserLevel(user_id: number, level: number, query_runner: QueryRunner) {
        return db.query(`UPDATE users SET LEVEL = $1 WHERE id = $2`, [level, user_id], query_runner)
    }

    static async DBRestoreDeletedUser(user_id: number, query_runner: QueryRunner) {
        return await db.query(`UPDATE users SET is_deleted = false WHERE id = $1`, [user_id], query_runner)
    }

    static async DBCheckIsUserAlive(id: number) {
        return await db.query<{ id: number }[]>(`SELECT u.id FROM users u WHERE u.id = $1 AND u.is_deleted != true`, [id])
    }

    static async DBCheckExpiredAccount(): Promise<AdminResponseDto.CheckExpiredAccountResponse[]> {
        return await db.query(`SELECT u.id, u.email_token FROM users u WHERE u.is_verified != true`)
    }

    static async DBHardDeleteUser(userId: number, query_runner?: QueryRunner) {
        return await db.query(`DELETE FROM user WHERE id = $1`, [userId], query_runner)
    }
}
