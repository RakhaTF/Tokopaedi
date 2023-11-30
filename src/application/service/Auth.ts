import * as UserDto from "@domain/model/User"
import * as UserSchema from "helpers/JoiSchema/User";
import * as UserDomainService from "@domain/service/UserDomainService"
import moment from 'moment'
import jwt from 'jsonwebtoken'
import { env } from "process";

export async function Register(params: UserDto.CreateUserRequest) {
    const { address, level, username, email, password } = params
    const { error } = UserSchema.Register.validate({ address, level, username, email, password });

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

    return await UserDomainService.CreateUser({ ...params, createdAt: moment().unix(), updatedAt: moment().unix() });
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