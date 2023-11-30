import AuthRoute from "@adapters/inbound/http/routes/Auth";
import fp from "fastify-plugin";

export default fp(async (fastify, options) => {
    await fastify.register(AuthRoute, options)
})