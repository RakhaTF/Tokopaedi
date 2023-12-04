import * as UserDto from "@domain/model/User"
import * as UserSchema from "helpers/JoiSchema/User";
import UserDomainService from "@domain/service/UserDomainService"
import moment from 'moment'
import jwt from 'jsonwebtoken'
import { env } from "process";
import { hashPassword } from "helpers/Password/Password"
import { signJWT } from "helpers/jwt/jwt";


export default class AuthAppService {
    static async Register(params: UserDto.CreateUserRequest) {
        const { role = "user", name, email, password } = params
        await UserSchema.Register.validateAsync({ role, name, email, password });

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
        console.log({user_result})
        const expiresIn = process.env.EXPIRES_IN || "1h"

        const result = {
            token: await signJWT({
                userid: user_result.id
            }, process.env.JWT_SECRET || "TOKOPAEDI", { expiresIn }),
            user: user_result
        }

        return result
    }

    static async Login(params: UserDto.LoginParams) {
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
}