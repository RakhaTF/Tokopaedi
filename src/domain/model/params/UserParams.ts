import { RegisterRequest, LoginRequest } from "../request/UserRequest"

export type RegisterParams = RegisterRequest & {
    created_at: number
    email_token: string
}

export type LoginParams = LoginRequest

export type UpdateUserParams = {
    id: number
    email: string
    name: string
}

export type UpdateUserEditProfileParams = {
    id: number
    email: string
    name: string
}

export type ChangePasswordParams = {
    id: number
    oldPassword: string
    newPassword: string
}
