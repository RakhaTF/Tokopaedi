import { AdminRoute, AuthRoute, ProductRoute, TransactionRoute, UserRoute } from "@adapters/inbound/http/routes"
import fp from "fastify-plugin"

export default fp(async (fastify) => {
    await fastify.register(AuthRoute, { prefix: "/api/v1/auth/" })
    await fastify.register(UserRoute, { prefix: "/api/v1/user/" })
    await fastify.register(ProductRoute, { prefix: "/api/v1/product/" })
    await fastify.register(AdminRoute, { prefix: "/api/v1/admin/" })
    await fastify.register(TransactionRoute, { prefix: "/api/v1/transaction/" })
})
