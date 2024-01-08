import fp from "fastify-plugin"
import { FastifyInstance } from "fastify"
import fastifyHelmet from "@fastify/helmet"
import fastifyFormBody from "@fastify/formbody"
import fastifyMultipart from "@fastify/multipart"

export default fp(async (fastify: FastifyInstance) => {
    await fastify.register(fastifyHelmet).register(fastifyFormBody).register(fastifyMultipart)
})