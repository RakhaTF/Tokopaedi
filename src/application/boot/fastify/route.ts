import { AdminRoute, AuthRoute, ProductRoute } from "@adapters/inbound/http/routes";
import fp from "fastify-plugin";

export default fp(async (fastify, options) => {
    await fastify.register(AuthRoute, options)
    await fastify.register(ProductRoute, options)
    await fastify.register(AdminRoute, options)
})