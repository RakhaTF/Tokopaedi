export type CreateUserRequest = {
    name: string;
    email: string;
    password: string;
}

export type UpdateUserProfileRequest = {
    userid: number;
    name: string;
    email: string;
}

export type UpdateProfileRequest = {
    name: string;
    email: string;
}

export type DeleteUserRequest = {
    email: string;
}