export type GetAdminDataResult = {
    id: number;
    name: string;
    email: string;
    level?: number;
    created_at: number;
    group_rules?: string;
}

export type GetUserListResponse = {
    name: string;
    email: string;
    created_at: number;
}

export type GetUserDetailProfileResponse = {
    name: string;
    email: string;
    created_at: number;
}
export type GetAdminListQueryResult = {
    name: string;
    rights: string;
    rules_id: string;
}

export type GetAdminListResponse = {
    name: string;
    rights: string[];
    rules_id: number[];
}

export type GetRulesListResponse = {
    rules_id: number;
    rules: string;
}

export type GetUserGroupRulesResponse = {
    group_id: number;
    list_of_rules: string;
}