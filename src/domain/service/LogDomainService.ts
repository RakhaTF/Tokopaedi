import LogRepository from "@adapters/outbound/repository/LogRepository";
import { LogParamsDto } from "@domain/model/params";
import { QueryRunner } from "typeorm";

export default class LogDomainService {
    static async CreateLogDomain(params: LogParamsDto.CreateLogParams, query_runner?: QueryRunner) {
        const createLog = await LogRepository.CreateLog(params, query_runner)
        if (createLog.affectedRows < 1) {
            throw new Error("Failed to insert log.")
        }
    }
    
    static async GetSystemLogDomain(limit: number, whereClause: string) {
        const logList = await LogRepository.GetSystemLog(limit, whereClause)
        if (logList.length < 1) {
            throw new Error("No log found!")
        }
        return logList
    }
}