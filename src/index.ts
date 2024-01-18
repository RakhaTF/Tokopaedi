import fastify from "fastify"
import FastifyBaseAddon from "./application/boot/fastify/base"
import FastifyRouteAddon from "@application/boot/fastify/route"
import FastifySwaggerAddon from "@application/boot/fastify/swagger"
import Ajv from 'ajv'
import { AppDataSource } from "@infrastructure/postgres/connection"

//Ajv file plugin, so fastify could know what is isFile used in multer.
function ajvFilePlugin(ajv: Ajv) {
    return ajv.addKeyword({
        keyword: "isFile",
        compile: (_schema, parent) => {
            // Updates the schema to match the file type
            parent.type = "file"
            parent.format = "binary"
            delete parent.isFile

            return (field /* MultipartFile */) => !!field.file
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

    AppDataSource.initialize()
        .then(() => {
            console.log("Data Source has been initialized!")
        })
        .catch((err) => {
            console.error("Error during Data Source initialization", err)
            throw new Error("Failed to initialize database") // Throw an error if initialization fails
        })

    server.register(FastifyBaseAddon)
    server.register(FastifySwaggerAddon)
    server.register(FastifyRouteAddon)
    
    return server
}

export const server = fastify({
    logger: {
        transport: {
            target: "pino-pretty",
        },
    },
    ajv: { plugins: [ajvFilePlugin] },
})

export default buildServer
