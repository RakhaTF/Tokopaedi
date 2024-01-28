import { AppDataSource } from "@infrastructure/postgres/connection"
import { QueryRunner } from "typeorm"
import { UserResponseDto } from "@domain/model/response"
import { UserParamsDto } from "@domain/model/params"
import { Users } from "@domain/entity/Users"

const db = AppDataSource
export default class UserRepository {
    static async DBCreateUser(user: UserParamsDto.RegisterParams, query_runner?: QueryRunner): Promise<number> {
        if (query_runner && !query_runner.isTransactionActive) {
            throw new Error("Must in Transaction")
        }
        const result = await query_runner.manager.insert(Users, user)
        const insertId = result.raw[0].id;
        return insertId
    }

    static async DBGetEmailExist(email: string): Promise<UserResponseDto.GetEmailExistResult[]> {
        return await db.manager.find(Users, {
            select: { id: true },
            where: { email, is_deleted: false }
        })
    }

    static async DBCheckUserExists(email: string, query_runner?: QueryRunner) {
        return await query_runner.manager.findOneOrFail(Users, { where: { email, is_deleted: false } })
    }

    static async DBGetUserDataById(id: number, query_runner?: QueryRunner): Promise<UserResponseDto.GetUserDataByIdResult[]> {
        const result = await db.manager.createQueryBuilder(query_runner)
            .select([
                "u.id as id",
                "name",
                "email",
                "level",
                "created_at",
                "string_agg(DISTINCT d.rules_id::text, ',') as group_rules"
            ])
            .from("users", "u")
            .leftJoin("user_group_rules", "d", "u.level = d.group_id")
            .where("u.id = :id", { id })
            .groupBy("u.id")
            .getRawMany();
        return result
    }

    static async DBGetUserById(id: number, query_runner?: QueryRunner) {
        return await query_runner.manager.find(Users, {
            where: { id }
        })
    }

    static async DBGetUserEmailExist(email: string, query_runner?: QueryRunner): Promise<UserResponseDto.GetUserEmailExistResult[]> {
        return await query_runner.manager.find(Users, {
            select: { email: true },
            where: { email },
        })
    }

    static async DBUpdateUserEditProfile(params: UserParamsDto.UpdateUserEditProfileParams, query_runner?: QueryRunner) {
        const { email, id, name } = params

        //will execute update user name and email, where id
        return await query_runner.manager.update(Users, { id: id }, { name, email })
    }

    static async DBGetUserPasswordById(id: number, query_runner?: QueryRunner): Promise<UserResponseDto.GetUserPasswordByIdResult[]> {
        return await query_runner.manager.find(Users, {
            select: { id: true, password: true },
            where: { id }
        })
    }

    static async DBUpdatePassword(passEncrypt: string, id: number, query_runner?: QueryRunner) {
        return await query_runner.manager.update(Users, { id }, { password: passEncrypt })
    }

    static async DBFindUserByToken(token: string) {
        return await db.manager.find(Users, {
            select: { id: true, email: true, is_verified: true, email_token: true },
            where: { email_token: token }
        })
    }

    static async DBVerifyEmail(email: string, query_runner: QueryRunner) {
        return await query_runner.manager.update(Users, { email }, { is_verified: true, email_token: null })
    }
}
