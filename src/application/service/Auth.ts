import * as UserDto from "@domain/model/User"
import * as UserSchema from "helpers/JoiSchema/User";
import * as UserDomainService from "@domain/service/UserDomainService"
import moment from 'moment'
import jwt from 'jsonwebtoken'
import { env } from "process";
import { hashPassword } from "helpers/Password/Password"
import { signJWT } from "helpers/jwt/jwt";

export async function Register(params: UserDto.CreateUserRequest) {
    const { address, role = "user", username, email, password } = params
    const { error } = UserSchema.Register.validate({ address, role, username, email, password });

    if (error) {
        const errorMessages = error.details.map((detail) => ({
            path: detail.path.join('.'),
            message: detail.message
        }));
        return { message: "Validation errors", data: errorMessages };
    }

    const existingUser = await UserDomainService.GetUserDomain({ email })
    if (existingUser && existingUser.email == email) {
        throw new Error("Email already in use.");
    }

    const user = {
        username,
        email,
        password: await hashPassword(password),
        address,
        role,
        createdAt: moment().unix()
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
    const { error } = UserSchema.Login.validate({ email, password });

    if (error) {
        const errorMessages = error.details.map((detail) => ({
            path: detail.path.join('.'),
            message: detail.message
        }));
        return { message: "Validation errors", data: errorMessages };
    }

    const existingUser = await UserDomainService.CheckUserExistsDomain(email)
    if (!existingUser || existingUser.password !== password) {
        throw new Error("Wrong password!")
    }
    // ** This is our JWT Token
    const token = jwt.sign(
        { _id: existingUser.id, email: existingUser.email }, env.SECRET_KEY,
        { expiresIn: "1d" }
    );
    return { ...existingUser, token };
}

export async function AuthUser(token: string) {
    if (!token) {
        throw new Error("Unauthorized!")
    }

    return await UserDomainService.AuthUserDomain(token)
}