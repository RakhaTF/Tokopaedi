import fastify, { FastifyReply, FastifyRequest } from "fastify"
import FastifyBaseAddon from "./application/boot/fastify/base"
import FastifyRouteAddon from "@application/boot/fastify/route"
import FastifySwaggerAddon from "@application/boot/fastify/swagger"
import { AppDataSource } from "@infrastructure/mysql/connection"
import { TransactionScheduler } from "cronJobs/transaction-scheduler/Transaction"
import { UserScheduler } from "cronJobs/user-scheduler/User"
import { ProductScheduler } from "cronJobs/product-scheduler/Product"
import Ajv from 'ajv'

//Ajv file plugin, so fastify could know what is isFile used in multer.
function ajvFilePlugin(ajv: Ajv) {
    return ajv.addKeyword({
        keyword: 'isFile',
        compile: (_schema, parent) => {
            // Updates the schema to match the file type
            parent.type = 'file'
            parent.format = 'binary'
            delete parent.isFile

            return (field /* MultipartFile */) => !!field.file
        },
        error: {
            message: 'should be a file'
        }
    })
}

const server = fastify({
    logger: {
        transport: {
            target: "pino-pretty",
        },
    },
    ajv: { plugins: [ajvFilePlugin] }
});

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

server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
    //CronJobs
    new TransactionScheduler()
    new UserScheduler()
    new ProductScheduler()
})

server.post("/", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        // const result = await uploadImage(request);
        reply.send(request);
    } catch (error) {
        reply.send(error);
    }
})
