export type RegisterRequest = {
    name: string
    email: string
    password: string
    level: number
}

export type LoginRequest = {
    email: string
    password: string
}

export type UpdateUserRequest = {
    id: number
    email: string
    name: string
}

export type ChangePasswordRequest = {
    oldPassword: string
    newPassword: string
}
