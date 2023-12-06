import { FastifyInstance, FastifyPluginOptions, RouteOptions } from "fastify";
import AuthController from "../../controller/AuthController";
import * as Schema from "helpers/ApiSchema/ApiSchema"
import { AuthValidate } from "helpers/prehandler/AuthValidate";

const routes: RouteOptions[] = [
    {
        method: ["POST"],
        url: "/api/v1/auth/register",
        handler: AuthController.Register,
        schema: {
            body: Schema.BaseRequestSchema('Raihan', {
                name: { type: "string" },
                email: { type: "string" },
                password: { type: "string" },
                level: { type: "number" },
            }),
            response: Schema.BaseResponse({
                type: 'Object',
                message: {
                    token: { type: 'string' },
                    user: {
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            email: { type: "string" },
                            password: { type: "string" },
                            level: { type: "number" },
                            created_at: { type: "number" },
                            id: { type: "number" }
                        }
                    }
                }
            })
        }
    },
    {
        method: ["POST"],
        url: "/api/v1/auth/login",
        handler: AuthController.Login,
        schema: {
            body: Schema.BaseRequestSchema('Raihan', {
                email: { type: "string" },
                password: { type: "string" }
            }),
            response: Schema.BaseResponse({
                type: 'Object',
                message: {
                    token: { type: 'string' },
                    user: {
                        type: "object",
                        properties: {
                            id: { type: "number" },
                            name: { type: "string" },
                            email: { type: "string" },
                            created_at: { type: "number" },
                            authority: { type: "array", items: { type: "number" } }
                        }
                    }
                }
            })
        }
    },
]

export default async function AuthRoute(
    fastify: FastifyInstance,
    options: FastifyPluginOptions
) {
    fastify.addHook("preValidation", AuthValidate)
    for (const route of routes) {
        fastify.route({ ...route, config: options });
    }
}