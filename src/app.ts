/* v8 ignore start */
// import { TransactionScheduler } from "@cronJobs/transaction-scheduler/Transaction"
import BootAMQP from "@application/boot/amqp"
import buildServer from "./index"
// import { UserScheduler } from "@cronJobs/user-scheduler/User"
// import { ProductScheduler } from "@cronJobs/product-scheduler/Product"
import dotenvFlow from "dotenv-flow"
import path from "path"
import { CreateAMQPPubSub } from "@infrastructure/amqp/amqp"
import { GetProvinces } from "@adapters/outbound/amqp/common"

dotenvFlow.config({ path: path.resolve(__dirname, `../`) })

const server = buildServer()
const config = {
    NODE_ENV: process.env.NODE_ENV,
    HOST: process.env.HTTP_HOST,
    PORT: process.env.HTTP_PORT,
}

async function main() {
    try {
        const port = Number(config.PORT)
        server.listen({ port, host: config.HOST }, (err, address) => {
            if (err) {
                console.error(err)
                process.exit(1)
            }
            console.log(`Server listening at ${address}`)
            // CronJobs
            // new TransactionScheduler()
            // new UserScheduler()
            // new ProductScheduler()
        })

        await CreateAMQPPubSub({
            hostname: process.env.AMQP_HOSTNAME || "",
            vhost: process.env.AMQP_VHOST || "",
            username: process.env.AMQP_USERNAME || "",
            password: process.env.AMQP_PASSWORD || "",
            exchange: "pubsub-toko-delivery"
        });

        await BootAMQP()

        setInterval(async ()=>{
            await GetProvinces()
        }, 5000)
    } catch (e) {
        console.error(e)
        process.exit(1)
    }
}

main()
/* v8 ignore stop */
