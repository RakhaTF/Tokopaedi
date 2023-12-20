import TransactionAppService from "@application/service/Transaction";
import { IScheduler, Scheduler } from "cronJobs/Scheduler";

class TransactionScheduler extends Scheduler {
    constructor() {
        super("0 */10 * * * *");
    }
    private async CheckTransactionExpiration() {
        const expiredTransaction = await TransactionAppService.CheckExpiredTransaction()
        if (expiredTransaction) {
            return {
                success: true,
                error: new Error(undefined)
            }
        }
    }

    async executeJob(): Promise<IScheduler> {
        console.log("CRON JOB HIT")
        return await this.CheckTransactionExpiration()
    }

}

export default new TransactionScheduler()