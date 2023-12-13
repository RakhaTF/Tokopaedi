type Product = {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
}

export type ProductDetailResponse = Product
export type ProductListResponse = Product[]