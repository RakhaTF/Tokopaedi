import LogRepository from "@adapters/outbound/repository/LogRepository"
import { ApiError, ResultNotFoundError } from "@domain/model/Error/Error"
import { LogParamsDto } from "@domain/model/params"
import { RepoPaginationParams } from "key-pagination-sql"
import { QueryRunner } from "typeorm"

export default class LogDomainService {
    static async CreateLogDomain(params: LogParamsDto.CreateLogParams, query_runner?: QueryRunner) {
        if (query_runner && !query_runner?.isTransactionActive) {
            throw new ApiError("MUST_IN_TRANSACTION")
        }

        const createLog = await LogRepository.CreateLog(params, query_runner)
        if (createLog.raw < 1) {
            throw new Error("Failed to insert log.")
        }
    }

    static async GetSystemLogDomain(params: RepoPaginationParams) {
        const logList = await LogRepository.GetSystemLog(params)
        if (logList.length < 1) {
            throw new ResultNotFoundError("No log found!")
        }
        return logList
    }
}
