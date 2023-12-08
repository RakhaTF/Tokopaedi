export type UpdateProfileUserParams = {
    id: number;
    userid: number
    email: string;
    name: string;
}

export type UpdateProfileParams = {
    id: number;
    email: string;
    name: string;
}

export type DeleteUserParams = {
    id: number;
    email: string;
}