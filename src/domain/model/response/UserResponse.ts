export type GetEmailExistResult = {
    id: number
}

export type GetUserByIdResult = {
    id: number
    name: string
    email: string
    level: number
    created_at: number
}

export type GetUserDataByIdResult = {
    id: number
    name: string
    email: string
    level?: number
    created_at: number
    group_rules?: string
}

export type UserClaimsResponse = {
    id: number
    level: number
    authority: number[]
}

export type GetUserEmailExistResult = {
    email: string
}

export type GetUserPasswordByIdResult = {
    id: number
    password: string
}

export type CheckUserExistResult = {
    id: number
    name: string
    email: string
    password: string
    level: number
    created_at: number
    is_deleted: number
}
