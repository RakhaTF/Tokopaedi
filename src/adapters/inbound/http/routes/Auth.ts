import { FastifyInstance, FastifyPluginOptions, RouteOptions } from "fastify";
import AuthController from "../../controller/AuthController";
import * as Schema from "helpers/ApiSchema/ApiSchema"


const routes: RouteOptions[] = [
    {
        method: ["POST"],
        url: "/api/v1/auth/register",
        handler: AuthController.Register,
        schema: {
            body: Schema.BaseRequestSchema('Raihan', {
                username: {type: "string"},
                email: {type: "string"},
                password: {type: "string"},
                address: {type: "string"},
                role: {type: "string"},
            }),
            response: Schema.BaseResponse({
                type: 'Object',
                message: {
                    token: {type: 'string'},
                    user: {
                        type: "object",
                        properties: {
                            username: {type: "string"},
                            email: {type: "string"},
                            password: {type: "string"},
                            address: {type: "string"},
                            role: {type: "string"},
                            createdAt: {type: "number"},
                            id: {type: "number"}
                        }
                    }
                }
            })
        }
    },
    {
        method: ["POST"],
        url: "/api/v1/auth/login",
        handler: AuthController.Login
    }
]

export default async function AuthRoute(
    fastify: FastifyInstance,
    options: FastifyPluginOptions
) {
    for (const route of routes) {
        fastify.route({ ...route, config: options });
    }
}