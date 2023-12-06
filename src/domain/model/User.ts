

export type CreateUserRequest = {
    name: string;
    email: string;
    password: string;
    level: number;
}

export type CreateUserParams = CreateUserRequest & {
    created_at: number;
}

export type GetEmailExistResult = {
    id: number;
}

export type GetUserByIdResult = {
    name: string;
    email: string;
    level: number;
    created_at: number;
}

export type GetUserDataByIdResult = {
    id: number;
    name: string;
    email: string;
    level?: number;
    created_at: number;
    group_rules?: string;
}

export type UserClaimsResponse = {
    id: number;
    level: number;
    authority: number[];
}

export type UpdateUserRequest = {
    user_id: number;
    firstName?: string;
    lastName?: string;
    age?: number;
    email?: string;
}

export type UpdateUserParams = UpdateUserRequest & {
    updatedAt: number;
}

export type LoginRequest = {
    email: string;
    password: string;
}

export type LoginParams = LoginRequest