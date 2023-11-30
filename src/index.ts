import fastify from "fastify";

const server = fastify({
    logger: {
        transport: {
            target: "pino-pretty",
        },
    },
});

server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});

server.get("/", ()=>{
    console.log("test")
    return "hello";
})