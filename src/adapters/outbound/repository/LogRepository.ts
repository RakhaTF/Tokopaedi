import { AppDataSource } from "@infrastructure/postgres/connection"
import { QueryRunner } from "typeorm"
import { LogParamsDto } from "@domain/model/params"
import { RepoPaginationParams } from "key-pagination-sql"
import { Log } from "@domain/entity"

const db = AppDataSource

export default class LogRepository {
    static async CreateLog(params: LogParamsDto.CreateLogParams, query_runner?: QueryRunner) {
        return await query_runner.manager.insert(Log, params)
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
        LIMIT $1`,
            [limit + 1]
        )
    }
}
