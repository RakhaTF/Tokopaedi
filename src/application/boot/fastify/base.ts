import fp from "fastify-plugin"
import { FastifyInstance } from "fastify"
import fastifyHelmet from "@fastify/helmet"
import fastifyFormBody from "@fastify/formbody"
import fastifyMulter from "fastify-multer"
import { FilesObject } from "fastify-multer/lib/interfaces"

export default fp(async (fastify: FastifyInstance) => {
    await fastify.register(fastifyHelmet).register(fastifyFormBody).register(fastifyMulter.contentParser)
})

declare module 'fastify' {
    interface FastifyRequest {
        files: FilesObject;
    }
}