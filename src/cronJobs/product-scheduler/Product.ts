/* v8 ignore start */
import ProductAppService from "@application/service/Product"
import { IScheduler, Scheduler } from "@cronJobs/Scheduler"

export class ProductScheduler extends Scheduler {
    constructor() {
        super("0 */5 * * * *")
    }
    private async CheckLowStockProduct() {
        const lowStockProduct = await ProductAppService.CheckLowStockProduct()
        if (lowStockProduct) {
            return {
                success: true,
                error: new Error(undefined),
            }
        }
    }

    async executeJob(): Promise<IScheduler> {
        console.log("PRODUCT CRON JOB HIT")
        return await this.CheckLowStockProduct()
    }
}
/* v8 ignore end */