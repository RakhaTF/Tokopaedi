import { AppDataSource } from "@infrastructure/mysql/connection"
import { ResultSetHeader } from "mysql2"
import { QueryRunner } from "typeorm"
import { LogParamsDto } from "@domain/model/params"
import { RepoPaginationParams } from "key-pagination-sql"

const db = AppDataSource

export default class LogRepository {
    static async CreateLog(params: LogParamsDto.CreateLogParams, query_runner?: QueryRunner) {
        const { user_id, action, ip, browser, time } = params
        return await db.query<ResultSetHeader>(
            `
        INSERT INTO log(user_id, action, ip, browser, time)
        VALUES(?, ?, ?, ?, ?)
        `,
            [user_id, action, ip, browser, time],
            query_runner
        )
    }

    static async GetSystemLog(params: RepoPaginationParams) {
        const { limit, sort, whereClause } = params
        return await db.query(
            `
        SELECT l.id, l.user_id, u.name, l.action, l.ip, l.browser, l.time
        FROM log l
        JOIN user u ON l.user_id = u.id
        ${whereClause}
        ORDER BY l.id ${sort}
        LIMIT ?`,
            [limit + 1]
        )
    }
}
