import { FastifyInstance, FastifyPluginOptions, RouteOptions } from "fastify"
import TransactionController from "@adapters/inbound/controller/TransactionController"

const routes: RouteOptions[] = [
    {
        method: ["POST"],
        url: "midtrans/notification",
        handler: TransactionController.MidtransNotification
    },
]

export default async function TransactionRoute(fastify: FastifyInstance, options: FastifyPluginOptions) {
    for (const route of routes) {
        fastify.route({ ...route, config: options })
    }
}
