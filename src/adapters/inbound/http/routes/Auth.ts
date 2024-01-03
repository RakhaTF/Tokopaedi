import { FastifyInstance, FastifyPluginOptions, RouteOptions } from "fastify"
import AuthController from "../../controller/AuthController"
import * as Schema from "helpers/ApiSchema/ApiSchema"

const routes: RouteOptions[] = [
    {
        method: ["POST"],
        url: "register",
        handler: AuthController.Register,
        schema: {
            tags: ["Auth"],
            body: Schema.BaseRequestSchema("Raihan", {
                name: { type: "string" },
                email: { type: "string" },
                password: { type: "string" },
            }),
            response: Schema.BaseResponse({
                type: "Object",
                message: {
                    id: { type: "number" },
                    name: { type: "string" },
                    email: { type: "string" },
                    level: { type: "number" },
                    created_at: { type: "number" },
                },
            }),
        },
    },
    {
        method: ["POST"],
        url: "login",
        handler: AuthController.Login,
        schema: {
            tags: ["Auth"],
            body: Schema.BaseRequestSchema("Raihan", {
                email: { type: "string" },
                password: { type: "string" },
            }),
            response: Schema.BaseResponse({
                type: "Object",
                message: {
                    token: { type: "string" },
                    user: {
                        type: "object",
                        properties: {
                            id: { type: "number" },
                            name: { type: "string" },
                            email: { type: "string" },
                            created_at: { type: "number" },
                            authority: { type: "array", items: { type: "number" } },
                        },
                    },
                },
            }),
        },
    },
]

export default async function AuthRoute(fastify: FastifyInstance, options: FastifyPluginOptions) {
    for (const route of routes) {
        fastify.route({ ...route, config: options })
    }
}
