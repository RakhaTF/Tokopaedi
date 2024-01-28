import LogRepository from "@adapters/outbound/repository/LogRepository"
import { LogParamsDto } from "@domain/model/params"
import { RepoPaginationParams } from "key-pagination-sql"
import { QueryRunner } from "typeorm"

export default class LogDomainService {
    static async CreateLogDomain(params: LogParamsDto.CreateLogParams, query_runner?: QueryRunner) {
        const createLog = await LogRepository.CreateLog(params, query_runner)
        if (createLog.raw < 1) {
            throw new Error("Failed to insert log.")
        }
    }

    static async GetSystemLogDomain(params: RepoPaginationParams) {
        const logList = await LogRepository.GetSystemLog(params)
        if (logList.length < 1) {
            throw new Error("No log found!")
        }
        return logList
    }
}
