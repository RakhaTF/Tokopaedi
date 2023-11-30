export type CreateUserRequest = {
    username: string;
    email: string;
    password: string;
    address: string;
    level: string;
}

export type CreateUserParams = CreateUserRequest & {
    createdAt: number;
    updatedAt: number;
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