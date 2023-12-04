import * as UserDto from "@domain/model/User"
import * as UserSchema from "helpers/JoiSchema/User";
import * as UserDomainService from "@domain/service/UserDomainService"
import moment from 'moment'
import jwt from 'jsonwebtoken'
import { env } from "process";
import { hashPassword, checkPassword } from "helpers/Password/Password"
import { signJWT } from "helpers/jwt/jwt";

export async function Register(params: UserDto.CreateUserRequest) {
    const { role = "user", name, email, password } = params
    await UserSchema.Register.validateAsync({ name, email, password, role});

    const existingUser = await UserDomainService.GetUserDomain({ email })
    if (existingUser && existingUser.email == email) {
        throw new Error("Email already in use.");
    }

    const user = {
        name,
        email,
        password: await hashPassword(password),
        role,
        created_at: moment().unix()
    }

    const user_result = await UserDomainService.CreateUser(user);
    const expiresIn = process.env.EXPIRES_IN || "1h"

    const result = {
        token: await signJWT({
            userid: user_result.id
        }, process.env.JWT_SECRET || "TOKOPAEDI", {expiresIn}),
        user: user_result
    }

    return result
}

export async function Login(params: UserDto.LoginParams) {
    const { email, password } = params
    await UserSchema.Login.validateAsync({ email, password });

    const existingUser = await UserDomainService.CheckUserExistsDomain(email)

    const checkPasswordUser = await checkPassword(password, existingUser.password)
    if (!checkPasswordUser) {
        throw new Error("Wrong password!")
    }

    const expiresIn = process.env.EXPIRES_IN || "1h"

    const result = {
        token: await signJWT({
            userid: existingUser.id
        }, process.env.JWT_SECRET || "TOKOPAEDI", {expiresIn}),
        user: existingUser
    }
    return result
}

export async function AuthUser(token: string) {
    if (!token) {
        throw new Error("Unauthorized!")
    }

    return await UserDomainService.AuthUserDomain(token)
}