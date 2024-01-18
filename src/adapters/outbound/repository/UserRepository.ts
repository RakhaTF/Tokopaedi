import { AppDataSource } from "@infrastructure/postgres/connection"
import { QueryRunner } from "typeorm"
import { UserResponseDto } from "@domain/model/response"
import { UserParamsDto } from "@domain/model/params"
import { ResultSetHeader } from "mysql2"

const db = AppDataSource

export default class UserRepository {
    static async DBCreateUser(user: UserParamsDto.RegisterParams, query_runner?: QueryRunner) {
        if (query_runner && !query_runner.isTransactionActive) {
            throw new Error("Must in Transaction")
        }

        // const result = await db.query(`INSERT INTO users (NAME, email, PASSWORD, LEVEL, created_at, email_token) VALUES ($1,$2,$3,$4,$5,$6)`, [user.name, user.email, user.password, user.level, user.created_at, user.email_token], query_runner)

        // return result

        const result = await db.manager.createQueryBuilder()
            .useTransaction(true)
            .insert()
            .into("users")
            .values(user)
            .returning('id')
            .execute()

        console.log(result.raw); // In PostgreSQL, this will contain the inserted row(s) with the returning column(s)

        const insertId = result.raw[0].id; // Accessing the id of the inserted user
        console.log({insertId});
        return insertId
    }

    static async DBGetEmailExist(email: string): Promise<UserResponseDto.GetEmailExistResult[]> {
        const result = await db.query<UserResponseDto.GetEmailExistResult[]>(
            `
            SELECT 
            u.id
            FROM users u
            WHERE u.email = $1
            AND u.is_deleted != true`,
            [email]
        )
        return result
    }

    static async DBCheckUserExists(email: string, query_runner?: QueryRunner) {
        return await db.query<UserResponseDto.CheckUserExistResult[]>(
            `
            SELECT 
            u.id, u.name, u.email, u.password, u.level, u.is_verified, u.created_at, u.is_deleted
            FROM users u
            WHERE u.email = $1
            AND u.is_deleted != true`,
            [email],
            query_runner
        )
    }

    static async DBGetUserDataById(id: number, query_runner?: QueryRunner): Promise<UserResponseDto.GetUserDataByIdResult[]> {
        const result = await db.query<UserResponseDto.GetUserDataByIdResult[]>(
            `SELECT 
        u.id, u.name, u.email, u.level, u.created_at,
        GROUP_CONCAT(DISTINCT d.rules_id separator ',') as group_rules
        FROM users u
        LEFT JOIN user_group_rules d ON u.level = d.group_id
        WHERE u.id = $1
        GROUP BY u.id`,
            [id],
            query_runner
        )
        return result
    }

    static async DBGetUserById(id: number, query_runner?: QueryRunner): Promise<UserResponseDto.GetUserByIdResult[]> {
        const result = await db.query<UserResponseDto.GetUserByIdResult[]>(
            `
            SELECT 
            u.id, u.name, u.email, u.level, u.created_at
            FROM users u
            WHERE u.id = $1`,
            [id],
            query_runner
        )

        return result
    }

    static async DBGetUserEmailExist(email: string, query_runner?: QueryRunner): Promise<UserResponseDto.GetUserEmailExistResult[]> {
        const result = await db.query<UserResponseDto.GetUserEmailExistResult[]>(
            `
        SELECT u.email FROM users u WHERE u.email = $1`,
            [email],
            query_runner
        )

        return result
    }

    static async DBUpdateUserEditProfile(params: UserParamsDto.UpdateUserEditProfileParams, query_runner?: QueryRunner) {
        const result = await db.query<ResultSetHeader>(`UPDATE users SET NAME = $1, email = $2 WHERE id = $3 `, [params.name, params.email, params.id], query_runner)

        return result
    }

    static async DBGetUserPasswordById(id: number, query_runner?: QueryRunner): Promise<UserResponseDto.GetUserPasswordByIdResult[]> {
        const result = await db.query<UserResponseDto.GetUserPasswordByIdResult[]>(`SELECT a.id, a.password FROM users a WHERE id = $1`, [id], query_runner)

        return result
    }

    static async DBUpdatePassword(passEncrypt: string, id: number, query_runner?: QueryRunner) {
        const result = await db.query<ResultSetHeader>(`UPDATE users SET password = $1 WHERE id = $2`, [passEncrypt, id], query_runner)
        return result
    }

    static async DBFindUserByToken(token: string) {
        return await db.query<UserResponseDto.FindUserByTokenResult[]>(`SELECT id, email, is_verified, email_token FROM users WHERE email_token = $1`, [token])
    }

    static async DBVerifyEmail(email: string, query_runner: QueryRunner) {
        return await db.query<ResultSetHeader>(`UPDATE users SET is_verified = true, email_token = NULL WHERE email = $1`, [email], query_runner)
    }
}
