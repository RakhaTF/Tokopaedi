/* v8 ignore start */
import { TransactionScheduler } from "@cronJobs/transaction-scheduler/Transaction"
import buildServer from "./index"
import { UserScheduler } from "@cronJobs/user-scheduler/User"
import { ProductScheduler } from "@cronJobs/product-scheduler/Product"
import dotenvFlow from "dotenv-flow"
import path from "path"
import "reflect-metadata";

dotenvFlow.config({ path: path.resolve(__dirname, `../`) })

const server = buildServer()
const config = {
    NODE_ENV: process.env.NODE_ENV,
    HOST: process.env.HTTP_HOST,
    PORT: process.env.HTTP_PORT,
}

/* istanbul ignore if -- @preserve */
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
            new TransactionScheduler()
            new UserScheduler()
            new ProductScheduler()
        })
    } catch (e) {
        console.error(e)
        process.exit(1)
    }
}

main()
/* v8 ignore stop */
