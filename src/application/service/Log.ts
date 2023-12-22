import { CommonRequestDto } from "@domain/model/request"
import LogDomainService from "@domain/service/LogDomainService"
import unicorn from "format-unicorn/safe"
import { GenerateWhereClause, Paginate } from "key-pagination-sql"
import * as CommonSchema from "helpers/JoiSchema/Common"

export default class LogAppService {
    static async GetSystemLog(params: CommonRequestDto.PaginationRequest) {
        await CommonSchema.Pagination.validateAsync(params)
        const { lastId = 0, limit = 100, search, sort = "ASC" } = params

        /*
        search filter, to convert filter field into sql string
        e.g: ({user_id} = "1" AND {time} > 1000) will turn into ((l.user_id = "1" AND p.time > 1000))
        every field name need to be inside {}
        */
        let searchFilter = search || ""
        searchFilter = unicorn(searchFilter, {
            user_id: "l.user_id",
            time: "l.time",
            action: "l.action",
            name: "u.name",
        })

        //Generate whereClause
        const whereClause = GenerateWhereClause({ lastId, searchFilter, sort, tableAlias: "l", tablePK: "id" })

        const log = await LogDomainService.GetSystemLogDomain({ limit: Number(limit), whereClause, sort })

        //Generate pagination
        const result = Paginate({ data: log, limit })
        return result
    }
}
