import fastify, { FastifyReply, FastifyRequest } from "fastify"
import FastifyBaseAddon from "./application/boot/fastify/base"
import FastifyRouteAddon from "@application/boot/fastify/route"
import FastifySwaggerAddon from "@application/boot/fastify/swagger"
import { AppDataSource } from "@infrastructure/mysql/connection"
import { TransactionScheduler } from "cronJobs/transaction-scheduler/Transaction"
import { UserScheduler } from "cronJobs/user-scheduler/User"
import { ProductScheduler } from "cronJobs/product-scheduler/Product"
import { v2 as cloudinary } from 'cloudinary'
import path from "path"
import fs from 'fs';

const server = fastify({
    logger: {
        transport: {
            target: "pino-pretty",
        },
    },
})

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
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
    //CronJob to check if there is an expire transaction
    new TransactionScheduler()
    new UserScheduler()
    new ProductScheduler()
})

async function uploadImage(request: FastifyRequest) {
    // Get the file from the request
    const file = await request.file();

    // Define the destination path for the uploaded file
    const destPath = path.join(__dirname, '../src/uploads', file.filename);
    // Create a write stream to save the file locally
    const writeStream = fs.createWriteStream(destPath);

    // Pipe the file data to the write stream
    await new Promise((resolve, reject) => {
        file.file.pipe(writeStream);
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
    });

    // Now that the file is saved locally, we can upload it to Cloudinary
    const buffer = fs.readFileSync(destPath);
    
    return new Promise((resolve, reject) => {
        //extracting filename and removing the file extension.
        const filename = file.filename.split('.')[0]
        cloudinary.uploader.upload_stream(
            { resource_type: 'auto', folder: "tokopaedi/products", upload_preset: "tokopaedi", public_id: filename },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    //will delete the file after every successful upload.
                    fs.unlinkSync(destPath);
                    resolve(result);
                }
            }
        ).end(buffer);
    });
}

server.post("/", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const result = await uploadImage(request);
        reply.send(result);
    } catch (error) {
        reply.send(error);
    }
})
