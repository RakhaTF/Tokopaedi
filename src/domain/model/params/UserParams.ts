import { RegisterRequest, LoginRequest } from "../request/UserRequest";

export type RegisterParams = RegisterRequest & {
    level: number;
    created_at: number;
}

export type LoginParams = LoginRequest

export type UpdateUserParams = {
    id: number;
    email: string;
    name: string;
}

export type UpdateUserEditProfileParams = {
    id: number;
    email: string;
    name: string;
}

export type ChangePasswordParams = {
    id: number;
    oldPassword: string;
    newPassword: string;
}