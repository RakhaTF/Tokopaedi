export type RegisterRequest = {
    name: string;
    email: string;
    password: string;
}

export type LoginRequest = {
    email: string;
    password: string;
}

export type UpdateUserRequest = {
    id: number;
    email: string;
    name: string;
}