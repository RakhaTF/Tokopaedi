import AdminAppService from "@application/service/Admin"
import { IScheduler, Scheduler } from "cronJobs/Scheduler"

export class UserScheduler extends Scheduler {
    constructor() {
        super("0 */2 * * * *")
    }

    //expired account is account with unverified email.
    private async CheckExpiredAccount() {
        const expiredAccount = await AdminAppService.CheckExpiredAccount()
        if (expiredAccount) {
            return {
                success: true,
                error: new Error(undefined),
            }
        }
    }

    async executeJob(): Promise<IScheduler> {
        console.log("USER CRON JOB HIT")
        return await this.CheckExpiredAccount()
    }
}
