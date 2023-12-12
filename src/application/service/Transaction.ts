import { TransactionParamsDto } from "@domain/model/params";
import * as TransactionSchema from "helpers/JoiSchema/Transaction"
import TransactionDomainService from "@domain/service/TransactionDomainService";
import { AppDataSource } from "@infrastructure/mysql/connection";
import ProductDomainService from "@domain/service/ProductDomainService";
import moment from "moment";

export default class TransactionAppService {
    static async CreateTransactionService(params: TransactionParamsDto.CreateTransactionParams) {
        const { product_id, qty, id } = params

        await TransactionSchema.CreateTransaction.validateAsync(params)
        if (product_id.length != qty.length) {
            throw new Error("Product_id and qty not match")
        }

        //check if there's an unpaid transaction
        const pendingTransaction = await TransactionDomainService.GetPendingTransactionDomain(id)
        if(pendingTransaction.length > 0){
            throw new Error("Please pay your current transaction.")
        }

        const products = await ProductDomainService.GetProductsPricesDomain(product_id)
        //looping to get total of items price
        let items_price = 0;
        for (let i = 0; i < product_id.length; i++) {
            const product = products.find(p => p.id === product_id[i]);
            items_price += parseFloat(product.price) * qty[i];
        }

        const db = AppDataSource;
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            const { insertId } = await TransactionDomainService.CreateTransactionIdDomain({ ...params, items_price }, query_runner);

            //auto create transaction_status after every create transaction.
            await TransactionDomainService.CreateTransactionStatusDomain({ transaction_id: insertId, update_time: moment().unix() }, query_runner)
            
            let insertOrderObj = {
                insertId,
                product_id,
                qty
            }

            await TransactionDomainService.InsertOrderItemDomain(insertOrderObj, query_runner)

            const getOrderItem = await TransactionDomainService.GetOrderItemByOrderIdDomain(insertId, query_runner)

            await query_runner.commitTransaction();
            await query_runner.release();

            return getOrderItem
        } catch (error) {
            await query_runner.rollbackTransaction();
            await query_runner.release();
            throw error
        }
    }

    static async UpdateTransactionProductQtyService(params: TransactionParamsDto.UpdateTransactionParams) {
        await TransactionSchema.UpdateTransactionService.validateAsync(params)
        const {  order_id, product_id, qty, updated_at } = params

        // Fetch the current product details
        const product = await ProductDomainService.GetProductsPricesDomain([product_id])

        // Fetch the current order details
        const currentOrder = await TransactionDomainService.GetTransactionDetailDomain(order_id)
        console.log({ currentOrder })
        // Find the current product in the order
        const currentProductOrder = currentOrder.find(order => order.product_id === product_id)
        console.log({currentProductOrder})
        // Calculate the difference in quantity
        const qtyDifference = qty - currentProductOrder.qty

        // Calculate the difference in price
        const priceDifference = parseFloat(product[0].price) * qtyDifference

        // Update the order with the new quantity
        let updateOrderObj = {
            order_id,
            product_id,
            qty
        }

        await TransactionDomainService.UpdateOrderDomain(updateOrderObj)

        // Update the transaction with the new items_price
        await TransactionDomainService.UpdateTransactionProductQtyDomain({ order_id, items_price: currentOrder.items_price + priceDifference, updated_at })

        return true
    }
}