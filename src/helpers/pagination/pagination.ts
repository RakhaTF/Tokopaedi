import { PaginationParamsDto } from "@domain/model/params"

const DEFAULT_ID = 1;

export function GenerateWhereClause(params: PaginationParamsDto.GenerateWhereClauseParams) {
    const { lastId, searchFilter, sort, tableAlias, tablePK = "id" } = params


    /**
     * TablePK = Table primary key, used to sort.
     * TableAlias = Alias used for table in repository/query
     */
     let whereClause = "WHERE 1=1"
    if (lastId >= DEFAULT_ID) {
        whereClause += ` AND ${tableAlias}.${tablePK} ${sort === "ASC" ? ">" : "<"} ${lastId}`
    }
    if (searchFilter !== "") {
        whereClause += ` AND (${searchFilter})`
    }
    return whereClause
}

export function Paginate(params: PaginationParamsDto.Paginate) {
    const { data, limit } = params
    /**
         * lastId = last data id
         * by default / first time endpoint hit, lastId is 0.
         * if lastId <= 0 after the first hit, there is no more data to fetch from database.
         * if lastId >= 1, there are more data to fetch.
         */
    const result = {
        data: [],
        column: [],
        hasNext: false,
        dataCount: 0,
        lastId: 0
    }

    if (data.length > limit) {
        result.hasNext = data.length > limit
        data.length = limit
        const lastData = data[data.length - 1]
        result.lastId = lastData.id
    }
    //to extract data values
    result.data = data.map(Object.values)
    
    //to extract data keys as column name
    result.column = Object.keys(data[0])
    
    result.dataCount = result.data.length

    return result
}