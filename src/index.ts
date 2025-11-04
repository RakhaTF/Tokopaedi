import fastify from "fastify"
import FastifyBaseAddon from "./application/boot/fastify/base"
import FastifyRouteAddon from "@application/boot/fastify/route"
import FastifySwaggerAddon from "@application/boot/fastify/swagger"
import Ajv from "ajv"
import { AppDataSource } from "@infrastructure/mysql/connection"
import cors from '@fastify/cors'

function ajvFilePlugin(ajv: Ajv) {
    return ajv.addKeyword({
        keyword: "isFile",
        compile: (_schema, parent) => {
            parent.type = "file"
            parent.format = "binary"
            delete parent.isFile
            return (field) => !!field.file
        },
        error: {
            message: "should be a file",
        },
    })
}

function buildServer() {
    const server = fastify({
        logger: {
            transport: {
                target: "pino-pretty",
            },
        },
        ajv: { plugins: [ajvFilePlugin] },
    })

    server.register(cors, {
        methods: ["PUT", "GET", "POST"],
        allowedHeaders: ['Content-Type', 'Authorization']
    })

    AppDataSource.initialize()
        .then(() => {
            console.log("Data Source has been initialized!")
        })
        .catch((err) => {
            console.log({err})
            console.error("Error during Data Source initialization", err)
        })

    server.register(FastifyBaseAddon)
    server.register(FastifySwaggerAddon)
    server.register(FastifyRouteAddon)

    return server
}

export default buildServer