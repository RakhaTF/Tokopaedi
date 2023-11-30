import fp from "fastify-plugin";
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import fastifyHelmet from "@fastify/helmet";
import fastifyFormBody from "@fastify/formbody";



export default fp(async (fastify: FastifyInstance, _options: FastifyPluginOptions) => {
    await fastify.register(fastifyHelmet)
        .register(fastifyFormBody)
});