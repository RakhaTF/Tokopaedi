export type PayTransactionEmailParams = {
    username: string;
    email: string;
    products: {
        productName: string;
        quantity: number;
        price: number;
    }[]
    total: number;
}