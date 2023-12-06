import { User } from "@domain/model/BaseClass/User";
import { UserClaimsResponse } from "@domain/model/User";
import { FastifyRequest } from "fastify"
import { verifyJWT } from "helpers/jwt/jwt";
import Joi from "joi";

declare module 'fastify' {
    interface FastifyRequest {
        user: User;
    }
}

type AuthorizeParams = {
    rules: number;
    user_level: number;
    user_authority: number[];
};

if (!process.env.SUPER_ADMIN_LEVEL || process.env.SUPER_ADMIN_LEVEL == "") {
    throw new Error("Please set Super Admin Level");
}

let superadmin_level = parseInt(process.env.MMB_SUPER_ADMIN_LEVEL || "0");

function authorize(data: AuthorizeParams): number {
    try {
        const schema = Joi.object({
            rules: Joi.number().required(),
            user_level: Joi.number().required(),
            user_authority: Joi.array().items(Joi.number()).required(),
        });

        const res = schema.validate(data);
        if (res.error) {
            return 0;
        }

        if (
            data.user_authority.length < 1 &&
            superadmin_level != data.user_level
        ) {
            return 0;
        }

        if (superadmin_level == data.user_level) {
            return 1;
        }

        if (data.user_authority.includes(data.rules)) {
            return 1;
        }

        return 0;
    } catch (x_x) {
        console.log(x_x);
        return 0;
    }
}

export async function AuthValidate(request: FastifyRequest) {
    try {
        const user = new User()

        if (!request.headers || !request.headers.authorization || request.headers.authorization == "") {
            throw new Error("PLEASE_LOGIN_FIRST");
        }

        //Verifying Token
        const user_claims = await verifyJWT<UserClaimsResponse>(request.headers.authorization, process.env.JWT_SECRET)

        const checkClaims = Joi.object({
            id: Joi.number().required(),
            level: Joi.number().required(),
            authority: Joi.array().items(Joi.number()).required()
        }).unknown(true)

        await checkClaims.validateAsync(user_claims);

        user.set(user_claims)
        request.user = user

    } catch (error) {
        throw error
    }
}

export function CheckAuthAdmin({ rules }: { rules: number }) {
    return async function (request: FastifyRequest) {
        const user = request.user;
        if (user.id < 1) {
            throw new Error("PLEASE_LOGIN_FIRST");
        }
        if (rules) {
            if (
                !authorize({
                    rules,
                    user_level: user.level,
                    user_authority: user.authority,
                })
            ) {
                throw new Error("NOT_ENOUGH_RIGHTS");
            }
        }
    }
}