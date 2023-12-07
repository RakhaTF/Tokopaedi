import { AdminRoute, AuthRoute, ProductRoute, ShippingAddressRoute, UserRoute } from "@adapters/inbound/http/routes";
import fp from "fastify-plugin";

export default fp(async (fastify, options) => {
    await fastify.register(AuthRoute, options)
    await fastify.register(UserRoute, options)
    await fastify.register(ProductRoute, options)
    await fastify.register(AdminRoute, options)
    await fastify.register(ShippingAddressRoute, options)
})