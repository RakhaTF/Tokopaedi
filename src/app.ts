import { TransactionScheduler } from "@cronJobs/transaction-scheduler/Transaction";
import buildServer from "./index";
import { UserScheduler } from "@cronJobs/user-scheduler/User";
import { ProductScheduler } from "@cronJobs/product-scheduler/Product";

const server = buildServer();

async function main() {
  try {
    const port = Number(process.env.HTTP_PORT);
    server.listen({ port: port, host: '0.0.0.0' }, (err, address) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      console.log(`Server listening at ${address}`);
      // CronJobs
      new TransactionScheduler();
      new UserScheduler();
      new ProductScheduler();
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();