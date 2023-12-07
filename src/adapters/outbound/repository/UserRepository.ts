import { AppDataSource } from "@infrastructure/mysql/connection";
import { User } from "@domain/entity/User";
import { error } from "console";
import { QueryRunner } from 'typeorm';
import { UserResponseDto } from "@domain/model/response";
import { UserParamsDto } from "@domain/model/params";

const db = AppDataSource;

export default class UserRepository {
    static async DBCreateUser(user: UserParamsDto.RegisterParams, query_runner?:QueryRunner){
        if(query_runner && !query_runner.isTransactionActive){
            throw new error("Must in Transaction")
        }

        const result = await db.query(`INSERT INTO user (NAME, email, PASSWORD, LEVEL, created_at) VALUES (?,?,?,?,?)`, 
        [user.name, user.email, user.password, user.level, user.created_at], query_runner)

        return result
    }

    static async DBGetEmailExist(email: string): Promise<UserResponseDto.GetEmailExistResult[]> {
        const result = await db.query<UserResponseDto.GetEmailExistResult[]>(`
            SELECT 
            u.id
            FROM user u
            WHERE u.email = ?`, [email]
        )
        return result
    }

    static async DBCheckUserExists(email: string) {
        return await db.query<User[]>(`
            SELECT 
            u.id, u.name, u.email, u.password, u.level, u.created_at
            FROM user u
            WHERE u.email = ?`, [email]
        )
    }

    static async DBGetUserDataById(id: number): Promise<UserResponseDto.GetUserDataByIdResult[]>{
        const result = await db.query<UserResponseDto.GetUserDataByIdResult[]>(`SELECT 
        u.id, u.name, u.email, u.level, u.created_at,
        GROUP_CONCAT(DISTINCT d.rules_id separator ',') as group_rules
        FROM user u
        LEFT JOIN user_group_rules d ON u.level = d.group_id
        WHERE u.id = ?
        GROUP BY u.id`, [id])
        return result
    }

    static async DBGetUserById(id: number, query_runner?: QueryRunner):  Promise<UserResponseDto.GetUserByIdResult[]> {
        const result = await db.query<UserResponseDto.GetUserByIdResult[]>(`
            SELECT 
            u.id, u.name, u.email, u.level, u.created_at
            FROM user u
            WHERE u.id = ?`, [id], query_runner
        )

        return result
    }

    static async DBGetUserEmailExist(email: string): Promise<UserResponseDto.GetUserEmailExistResult[]> {
        const result = await db.query<UserResponseDto.GetUserEmailExistResult[]>(`
        SELECT u.email FROM user u WHERE u.email = ?`, [email])

        return result
    }

    static async DBUpdateUserEditProfile(params: UserParamsDto.UpdateUserEditProfileParams){
        const result = await db.query(`UPDATE user SET NAME = ?, email = ? WHERE id = ? `, [params.id, params.email, params.name])

        return result
    }
}