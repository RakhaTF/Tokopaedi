import { UserRole } from "@domain/entity/User";

export type CreateUserRequest = {
    name: string;
    email: string;
    password: string;
    role: UserRole;
}

export type CreateUserParams = CreateUserRequest & {
    created_at: number;
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