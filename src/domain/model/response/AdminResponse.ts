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