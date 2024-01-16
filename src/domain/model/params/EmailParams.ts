export type PayTransactionEmailParams = {
    username: string
    email: string
    products: {
        productName: string
        quantity: number
        price: number
    }[]
    total: number
}

export type successfulTransactionEmailParams = {
    email: string
    name: string
    orderId: number
    totalAmount: string
    paymentMethod: string
    paidTime: string
    items: {
        productName: string
        quantity: number
    }[]
    address: string
    city: string
    province: string
    postalCode: string
    country: string
}
