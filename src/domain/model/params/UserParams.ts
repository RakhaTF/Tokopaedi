import { RegisterRequest, LoginRequest } from "../request/UserRequest";

export type RegisterParams = RegisterRequest & {
    level: number;
    created_at: number;
}

export type LoginParams = LoginRequest