import { AppDataSource } from "@infrastructure/mysql/connection";
import * as UserDto from "@domain/model/User"
import { User } from "@domain/entity/User";
import { error, time } from "console";
import moment from "moment";
import { QueryRunner } from 'typeorm';

const db = AppDataSource;

export default class UserRepository {
    static async DBCreateUser(user: UserDto.CreateUserParams, query_runner?:QueryRunner){
        if(query_runner && !query_runner.isTransactionActive){
            throw new error("Must in Transaction")
        }

        const result = await db.query(`INSERT INTO user (NAME, email, PASSWORD, LEVEL, created_at) VALUES (?,?,?,?,?)`, 
        [user.name, user.email, user.password, user.level, user.created_at], query_runner)

        return result
    }

    static async DBGetEmailExist(email: string): Promise<UserDto.GetEmailExistResult[]> {
        const result = await db.query<UserDto.GetEmailExistResult[]>(`
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

    static async DBGetUserDataById(id: number): Promise<UserDto.GetUserDataByIdResult[]>{
        const result = await db.query<UserDto.GetUserDataByIdResult[]>(`SELECT 
        u.id, u.name, u.email, u.password, u.level, u.created_at,
        GROUP_CONCAT(DISTINCT d.rules_id separator ',') as group_rules
        FROM user u
        LEFT JOIN user_group_rules d ON u.level = d.group_id
        WHERE u.id = ?
        GROUP BY u.id`, [id])
        return result
    }

    static async DBGetUserById(id: number, query_runner?: QueryRunner):  Promise<UserDto.GetUserByIdResult[]> {
        const result = await db.query<UserDto.GetUserByIdResult[]>(`
            SELECT 
            u.id, u.name, u.email, u.password, u.level, u.created_at
            FROM user u
            WHERE u.id = ?`, [id], query_runner
        )

        return result
    }
}