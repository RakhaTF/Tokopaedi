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

export type GetUserDetailProfileRequest = {
    email: string;
}

export type UpdateRuleRequest = {
    rule: string;
    rules_id: number;
}

export type AssignRuleRequest = {
    group_id: number;
    rules_id: number;
}

export type RevokeRuleRequest = {
    group_id: number;
    rules_id: number;
}

export type ChangeUserPassRequest = {
    userid: number;
    password: string;
    confirmPassword: string;
}

export type ChangePasswordRequest = {
    oldPassword: string;
    newPassword: string;
}