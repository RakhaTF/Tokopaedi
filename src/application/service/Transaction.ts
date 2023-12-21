import { LogParamsDto, TransactionParamsDto } from "@domain/model/params"
import * as TransactionSchema from "helpers/JoiSchema/Transaction"
import TransactionDomainService from "@domain/service/TransactionDomainService"
import { AppDataSource } from "@infrastructure/mysql/connection"
import ProductDomainService from "@domain/service/ProductDomainService"
import { CommonRequestDto, TransactionRequestDto } from "@domain/model/request"
import { TransactionResponseDto } from "@domain/model/response"
import moment from "moment-timezone"
import * as CommonSchema from "helpers/JoiSchema/Common";
import unicorn from "format-unicorn/safe";
import { GenerateWhereClause, Paginate } from "key-pagination-sql";
import LogDomainService from "@domain/service/LogDomainService"
import { Product } from "@domain/model/BaseClass/Product"
import { QueryRunner } from "typeorm"

export default class TransactionAppService {
    static async CreateTransactionService(params: TransactionParamsDto.CreateTransactionParams, logData: LogParamsDto.CreateLogParams) {
        const { product_id, qty, id } = params

        await TransactionSchema.CreateTransaction.validateAsync(params)
        if (product_id.length != qty.length) {
            throw new Error("Product_id and qty not match")
        }

        //check if there's an unpaid transaction
        const pendingTransaction = await TransactionDomainService.GetPendingTransactionDomain(id)
        if (pendingTransaction.length > 0) {
            throw new Error("Please pay your current transaction.")
        }

        const products = await ProductDomainService.GetProductsPricesAndStockDomain(product_id)
        //looping to get total of items price
        let items_price = 0
        for (let i = 0; i < product_id.length; i++) {
            const product = products.find((p) => p.id === product_id[i])

            //Additional layer of checking the product stock, if it's 0, user can't buy it & throw error.
            //If the user trying to buy more than the available stock, will throw the same error
            if(product.stock === 0 || product.stock < qty[i]){
                throw new Error(`Product ${product.name} is out of stock!`)
            }

            items_price += parseFloat(product.price.toString()) * qty[i]
        }

        /*
        * declare transaction expiration time based on when transaction is created, default is 30 minutes. 
        * if expired, transaction will be deleted.
        */
        const transactionExpireAt = moment.unix(params.created_at).add(30, 'minutes').unix()

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            const { insertId } = await TransactionDomainService.CreateTransactionIdDomain({ ...params, items_price, expire_at: transactionExpireAt }, query_runner)

            //auto create transaction_status after every create transaction.
            await TransactionDomainService.CreateTransactionStatusDomain({ transaction_id: insertId, update_time: moment().unix() }, query_runner)

            let insertOrderObj = {
                insertId,
                product_id,
                qty,
            }

            await TransactionDomainService.InsertOrderItemDomain(insertOrderObj, query_runner)

            const orderItem = await TransactionDomainService.GetOrderItemByOrderIdDomain(insertId, query_runner)

            /*
            Update product stock after create transaction
            */
            const productOrder = orderItem.map((tx) => {
                return {
                    product_id: tx.product_id,
                    qty: tx.qty,
                }
            })

            const updateProductPromises = productOrder.map(async (p) => {
                const productDetail = await ProductDomainService.GetProductDetailDomain(p.product_id)

                const updateProductData: Partial<Product> = {
                    ...productDetail,
                    stock: productDetail.stock - p.qty,
                }

                return ProductDomainService.UpdateProductDomain({ ...updateProductData, id: p.product_id }, query_runner)
            })

            await Promise.all(updateProductPromises)

            const getOrderItem = await TransactionDomainService.GetOrderItemByOrderIdDomain(insertId, query_runner)

            //Insert into log, to track user action.
            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()

            return getOrderItem
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }

    static async UpdateTransactionProductQtyService(params: TransactionParamsDto.UpdateTransactionProductQtyParams, logData: LogParamsDto.CreateLogParams) {
        await TransactionSchema.UpdateTransactionService.validateAsync(params)
        const { order_id, product_id, qty, updated_at } = params

        //additional checking to prevent mutate deleted transaction.
        await TransactionDomainService.CheckIsTransactionAliveDomain(order_id)

        // Fetch the current product details
        const product = await ProductDomainService.GetProductsPricesAndStockDomain([product_id])

        // Fetch the current order details
        const currentOrder = await TransactionDomainService.GetCurrentTransactionDetailDomain(order_id)

        // Find the current product in the order
        const currentProductOrder = currentOrder.find((order) => order.product_id === product_id)

        // Calculate the difference in quantity
        const qtyDifference = qty - currentProductOrder.qty

        // Calculate the difference in price
        const priceDifference = parseFloat(product[0].price.toString()) * qtyDifference

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            // Update the order with the new quantity
            let updateOrderObj = {
                order_id,
                product_id,
                qty,
            }

            await TransactionDomainService.UpdateOrderDomain(updateOrderObj, query_runner)

            // Update the transaction with the new items_price after qty changes (add or substract)
            const newprice = parseFloat(currentOrder[0].items_price) + priceDifference
            await TransactionDomainService.UpdateTransactionProductQtyDomain(
                {
                    order_id,
                    items_price: newprice,
                    updated_at,
                },
                query_runner
            )
            
            //insert to log to track user action
            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()
            return true
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }

    static async PayTransaction(params: TransactionRequestDto.PayTransactionRequest, logData: LogParamsDto.CreateLogParams) {
        await TransactionSchema.PayTransaction.validateAsync(params)
        const { transaction_id, expedition_name, payment_method, shipping_address_id, user_id } = params

        //additional checking to prevent mutate deleted transaction.
        await TransactionDomainService.CheckIsTransactionAliveDomain(transaction_id)

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            //create delivery_status with pending status. 0 = pending, 1 = on delivery, 2 = delivered
            const deliveryStatus: TransactionParamsDto.CreateDeliveryStatusParams = {
                transaction_id,
                status: 0,
                delivered_at: moment().unix(),
                expedition_name,
                is_delivered: 0,
                updated_at: moment().unix(),
            }
            await TransactionDomainService.CreateDeliveryStatusDomain(deliveryStatus, query_runner)

            /**
            update shipping address & shippping price
            update is paid: 1 = paid, 0 = unpaid
            update payment method: Cash | Credit Card | Debit Catd
            update paid_at & updated_at
            **/
            const SHIPPING_PRICE = Math.random() * 10000 * shipping_address_id //Use random number to generate dummy shippinng_price
            const payTransactionObject: TransactionParamsDto.PayTransactionRepositoryParams = {
                is_paid: 1,
                paid_at: moment().unix(),
                payment_method,
                shipping_address_id,
                shipping_price: SHIPPING_PRICE,
                updated_at: moment().unix(),
                user_id,
                transaction_id,
            }
            await TransactionDomainService.PayTransactionDomain(payTransactionObject, query_runner)

            //insert to log to track user action
            await LogDomainService.CreateLogDomain(logData, query_runner)

            return true
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        } finally {
            await query_runner.commitTransaction()
            await query_runner.release()
        }
    }

    static async GetTransactionDetail(id: number) {
        await TransactionSchema.TransactionId.validateAsync(id)
        const txnDetail = await TransactionDomainService.GetTransactionDetailDomain(id)

        //extract product name & qty
        const productId = txnDetail.product_bought_id.split(",")
        const productName = txnDetail.product_bought.split(",")
        const qty = txnDetail.qty.split(",")

        const product_bought = productName.map((prod, index) => {
            return {
                product_id: productId,
                product_name: prod,
                qty: qty[index],
            }
        })

        const paid_at = moment.unix(txnDetail.paid_at).tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss")
        const created_at = moment.unix(txnDetail.created_at).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss')

        const transaction: TransactionResponseDto.TransactionDetailResult = {
            user_id: txnDetail.user_id,
            transaction_id: txnDetail.transaction_id,
            name: txnDetail.name,
            product_bought,
            items_price: parseFloat(txnDetail.items_price),
            shipping_price: parseFloat(txnDetail.shipping_price),
            total_price: parseFloat(txnDetail.total_price),
            is_paid: txnDetail.is_paid,
            paid_at,
            transaction_status: txnDetail.transaction_status,
            delivery_status: txnDetail.delivery_status,
            shipping_address: {
                address: txnDetail.address,
                postal_code: txnDetail.postal_code,
                city: txnDetail.city,
                province: txnDetail.province,
                country: txnDetail.country,
            },
            created_at
        }
        return transaction
    }

    static async GetUserTransactionListByIdService({userid}: TransactionParamsDto.GetUserTransactionListByIdParams, paginationParams: CommonRequestDto.PaginationRequest) {
        await CommonSchema.Pagination.validateAsync(paginationParams)
        const { lastId = 0, limit = 100, search, sort = "ASC" } = paginationParams
        
        
        /*
        search filter, to convert filter field into sql string
        e.g: ({payment} = "Credit Card" AND {items_price} > 1000) will turn into ((t.payment_method = "Credit Card" AND t.items_price > 1000))
        every field name need to be inside {}
        */
       let searchFilter = search || ""
        searchFilter = unicorn(searchFilter, {
            payment: "t.payment_method",
            shipped_to: "t.shipping_address_id",
            items_price: "t.items_price",
            total_price: "t.total_price",
            created: "t.created_at",
            isDeleted: "t.is_deleted",
        })

        //Generate whereClause
        const whereClause = GenerateWhereClause({ lastId, searchFilter, sort, tableAlias: "t", tablePK: "id" })
        
        const transactionList = await TransactionDomainService.GetUserTransactionListByIdDomain(userid, { whereClause, limit: Number(limit), sort })

        //Generate pagination
        const result = Paginate({ data: transactionList, limit })
        
        return result
    }

    static async ApproveTransaction(params: TransactionRequestDto.UpdateTransactionStatusRequest, logData: LogParamsDto.CreateLogParams) {
        await TransactionSchema.UpdateTransactionStatus.validateAsync(params)
        const { transaction_id } = params

        //additional checking to prevent mutate deleted transaction.
        await TransactionDomainService.CheckIsTransactionAliveDomain(transaction_id)

        const transactionDetail = await TransactionDomainService.GetTransactionDetailDomain(transaction_id)

        const updateTransactionStatus: TransactionParamsDto.UpdateTransactionStatusParams = {
            status: 1, //0 = pending (default), 1 = approved, 2 = rejected
            transaction_id: transactionDetail.transaction_id,
            updated_at: moment().unix()
        }

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()
            await TransactionDomainService.UpdateTransactionStatusDomain(updateTransactionStatus, query_runner)
            //insert to log to track user action
            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction()
            return true
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }

    static async RejectTransaction(params: TransactionRequestDto.UpdateTransactionStatusRequest, logData: LogParamsDto.CreateLogParams) {
        await TransactionSchema.UpdateTransactionStatus.validateAsync(params)
        const { transaction_id } = params

        //additional checking to prevent mutate deleted transaction.
        await TransactionDomainService.CheckIsTransactionAliveDomain(transaction_id)

        const updateTransactionStatus: TransactionParamsDto.UpdateTransactionStatusParams = {
            status: 2, //0 = pending (default), 1 = approved, 2 = rejected
            transaction_id,
            updated_at: moment().unix()
        }

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            await TransactionDomainService.UpdateTransactionStatusDomain(updateTransactionStatus, query_runner)
            //insert to log to track user action
            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction()
            return true
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }

    static async UpdateDeliveryStatus(params: TransactionRequestDto.UpdateDeliveryStatusRequest, logData: LogParamsDto.CreateLogParams) {
        await TransactionSchema.UpdateDeliveryStatus.validateAsync(params)
        const { is_delivered, status, transaction_id } = params

        //additional checking to prevent mutate deleted transaction.
        await TransactionDomainService.CheckIsTransactionAliveDomain(transaction_id)

        //get transaction status if transaction hasn't been approved / rejected, can not update delivery status
        const transactionStatus = await TransactionDomainService.GetTransactionStatusDomain(transaction_id)

        if (transactionStatus.status !== 1) {
            switch (transactionStatus.status) {
                case 0:
                    throw new Error("Please approve the transaction first!");
                case 2:
                    throw new Error("This transaction is rejected!");
                default:
                    throw new Error("Invalid transaction status!");
            }
        }

        const updateDeliveryStatus: TransactionParamsDto.UpdateDeliveryStatusParams = {
            transaction_id,
            is_delivered, // 0 = pending, 1 = delivered
            status, //0 = Pending, 1 = On Delivery, 2 = Delivered, 3 = Rejected
            updated_at: moment().unix()
        }

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            await TransactionDomainService.UpdateDeliveryStatusDomain(updateDeliveryStatus, query_runner)
            //insert to log to track user action
            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction()
            return true
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }

    static async DeleteUserTransaction(transaction_id: number, logData: LogParamsDto.CreateLogParams) {
        await TransactionSchema.TransactionId.validateAsync(transaction_id)

        //additional checking to prevent mutate deleted transaction.
        await TransactionDomainService.CheckIsTransactionAliveDomain(transaction_id)

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            await TransactionDomainService.SoftDeleteTransactionDomain(transaction_id, query_runner)
            //insert to log to track user action
            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction()
            return true
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }
  
    static async SoftDeleteTransaction(transaction_id: number, logData: LogParamsDto.CreateLogParams) {
        await TransactionSchema.TransactionId.validateAsync(transaction_id)

        //additional checking to prevent mutate deleted transaction.
        await TransactionDomainService.CheckIsTransactionAliveDomain(transaction_id)

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            await TransactionDomainService.SoftDeleteTransactionDomain(transaction_id)

            //Insert into log, to track user action.
            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()
            return true;
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }

    static async CheckExpiredTransaction() {
        const pendingTransaction = await TransactionDomainService.GetAllPendingTransactionDomain()

        /*
        * Check if there are expired transaction, if the difference between expire_at and now in timestamp is <= 0,
        * The transaction is expired.
        */
        const now = moment().unix()
        const expiredTx = pendingTransaction.filter((tx) => moment.unix(tx.expire_at).diff(moment.unix(now), 'minutes') <= 0)

        if (expiredTx.length > 0) {
            const db = AppDataSource
            const query_runner = db.createQueryRunner()
            await query_runner.connect()

            try {
                await query_runner.startTransaction()

                const expirePromises = expiredTx.map((tx) => this.HandleExpiredTransaction(tx, query_runner))
                await Promise.all(expirePromises)

                return true
            } catch (error) {
                await query_runner.rollbackTransaction()
                throw error
            } finally {
                await query_runner.commitTransaction()
                await query_runner.release()
            }
        }
    }

    static async HandleExpiredTransaction(tx: TransactionResponseDto.GetAllPendingTransactionResponse, query_runner: QueryRunner) {
        const { product_bought_id, qty } = await TransactionDomainService.GetTransactionDetailDomain(tx.id)

        const productId = product_bought_id.split(",")
        const productQty = qty.split(",")

        //restore product stock from expired transaction.
        const updateProductPromises = productId.map((id, index) => this.RestoreProductStock(Number(id), Number(productQty[index]), query_runner))
        await Promise.all(updateProductPromises)

        //Insert into log to track cron job action.
        const logDataRestoreStock: LogParamsDto.CreateLogParams = {
            user_id: 1,
            action: `Restore Stock of Product Bought From Transaction #${tx.id}`,
            browser: `CRON JOB`,
            ip: '127.0.0.1',
            time: moment().unix()
        }
        await LogDomainService.CreateLogDomain(logDataRestoreStock, query_runner)
        
        
        //delete the transaction after successfully restore the stock
        await TransactionDomainService.SoftDeleteTransactionDomain(tx.id, query_runner)
        //Insert into log to track cron job action.
        const logDataDeleteTx: LogParamsDto.CreateLogParams = {
            user_id: 1,
            action: `Delete Expired Transaction #${tx.id}`,
            browser: `CRON JOB`,
            ip: '127.0.0.1',
            time: moment().unix()
        }
        await LogDomainService.CreateLogDomain(logDataDeleteTx, query_runner)
    }

    static async RestoreProductStock(id: number, qty: number, query_runner: QueryRunner) {
        const product = await ProductDomainService.GetProductDetailDomain(Number(id))

        const updateProductData: Partial<Product> = product
        updateProductData.stock = updateProductData.stock + Number(qty)

        await ProductDomainService.UpdateProductDomain({ ...updateProductData, id: Number(id) }, query_runner)
    }
}
