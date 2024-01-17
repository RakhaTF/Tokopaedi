import { AppDataSource } from "@infrastructure/mysql/connection"
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

        const result = await db.query<ResultSetHeader>(`INSERT INTO user (NAME, email, PASSWORD, LEVEL, created_at, email_token) VALUES (?,?,?,?,?,?)`, [user.name, user.email, user.password, user.level, user.created_at, user.email_token], query_runner)

        return result
    }

    static async DBGetEmailExist(email: string): Promise<UserResponseDto.GetEmailExistResult[]> {
        const result = await db.query<UserResponseDto.GetEmailExistResult[]>(
            `
            SELECT 
            u.id
            FROM user u
            WHERE u.email = ?
            AND u.is_deleted <> 1`,
            [email]
        )
        return result
    }

    static async DBCheckUserExists(email: string, query_runner?: QueryRunner) {
        return await db.query<UserResponseDto.CheckUserExistResult[]>(
            `
            SELECT 
            u.id, u.name, u.email, u.password, u.level, u.is_verified, u.created_at, u.is_deleted
            FROM user u
            WHERE u.email = ?`,
            [email],
            query_runner
        )
    }

    static async DBGetUserDataById(id: number, query_runner?: QueryRunner): Promise<UserResponseDto.GetUserDataByIdResult[]> {
        const result = await db.query<UserResponseDto.GetUserDataByIdResult[]>(
            `SELECT 
        u.id, u.name, u.email, u.level, u.created_at,
        GROUP_CONCAT(DISTINCT d.rules_id separator ',') as group_rules
        FROM user u
        LEFT JOIN user_group_rules d ON u.level = d.group_id
        WHERE u.id = ?
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
            FROM user u
            WHERE u.id = ?`,
            [id],
            query_runner
        )

        return result
    }

    static async DBGetUserEmailExist(email: string, query_runner?: QueryRunner): Promise<UserResponseDto.GetUserEmailExistResult[]> {
        const result = await db.query<UserResponseDto.GetUserEmailExistResult[]>(
            `
        SELECT u.email FROM user u WHERE u.email = ?`,
            [email],
            query_runner
        )

        return result
    }

    static async DBUpdateUserEditProfile(params: UserParamsDto.UpdateUserEditProfileParams, query_runner?: QueryRunner) {
        const result = await db.query<ResultSetHeader>(`UPDATE user SET NAME = ?, email = ? WHERE id = ? `, [params.name, params.email, params.id], query_runner)

        return result
    }

    static async DBGetUserPasswordById(id: number, query_runner?: QueryRunner): Promise<UserResponseDto.GetUserPasswordByIdResult[]> {
        const result = await db.query<UserResponseDto.GetUserPasswordByIdResult[]>(`SELECT a.id, a.password FROM user a WHERE id = ?`, [id], query_runner)

        return result
    }

    static async DBUpdatePassword(passEncrypt: string, id: number, query_runner?: QueryRunner) {
        const result = await db.query<ResultSetHeader>(`UPDATE user SET password = ? WHERE id = ?`, [passEncrypt, id], query_runner)
        return result
    }

    static async DBFindUserByToken(token: string) {
        return await db.query<UserResponseDto.FindUserByTokenResult[]>(`SELECT id, email, is_verified, email_token FROM user WHERE email_token = ?`, [token])
    }

    static async DBVerifyEmail(email: string, query_runner: QueryRunner) {
        return await db.query<ResultSetHeader>(`UPDATE user SET is_verified = 1, email_token = NULL WHERE email = ?`, [email], query_runner)
    }
}
