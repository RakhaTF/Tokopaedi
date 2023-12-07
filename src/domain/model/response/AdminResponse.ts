export type GetAdminDataResult = {
    id: number;
    name: string;
    email: string;
    level?: number;
    created_at: number;
    group_rules?: string;
}