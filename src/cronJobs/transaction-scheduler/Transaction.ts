import TransactionAppService from "@application/service/Transaction"
import { IScheduler, Scheduler } from "@cronJobs/Scheduler"

export class TransactionScheduler extends Scheduler {
    constructor() {
        super("0 */5 * * * *")
    }
    private async CheckTransactionExpiration() {
        const expiredTransaction = await TransactionAppService.CheckExpiredTransaction()
        if (expiredTransaction) {
            return {
                success: true,
                error: new Error(undefined),
            }
        }
    }

    async executeJob(): Promise<IScheduler> {
        console.log("TRANSACTION CRON JOB HIT")
        return await this.CheckTransactionExpiration()
    }
}
