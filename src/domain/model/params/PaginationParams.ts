export type GenerateWhereClauseParams = {
    searchFilter: string
    lastId: number
    sort: string
    tableAlias: string //example p alias for product
    tablePK?: string //example id
}

export type Paginate = {
    data: { id: number }[]
    limit: number
}

export type RepoPaginationParams = {
    limit: number;
    whereClause: string;
    sort: string;
}