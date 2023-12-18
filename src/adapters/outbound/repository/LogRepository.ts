import { AppDataSource } from "@infrastructure/mysql/connection";
import { ResultSetHeader } from "mysql2";
import { QueryRunner } from "typeorm";
import { LogParamsDto } from "@domain/model/params";

const db = AppDataSource;

export default class LogRepository {
    static async CreateLog(params: LogParamsDto.CreateLogParams, query_runner?: QueryRunner) {
        const { user_id, action, ip, browser, time} = params
        return await db.query<ResultSetHeader>(`
        INSERT INTO log(user_id, action, ip, browser, time)
        VALUES(?, ?, ?, ?, ?)
        `,[user_id, action, ip, browser, time], query_runner)
    }

    static async GetSystemLog(limit: number, whereClause: string) {
        return await db.query(`
        SELECT l.id, l.user_id, l.action, l.ip, l.browser, l.time
        FROM log l
        ${whereClause}
        LIMIT ?`, [limit + 1])
    }
}