export type CalculateShippingPrice = {
    expedition_name: string;
    shipping_address_id: number;
}

export type CalculateTotalPrice = {
    items_price: string;
    shipping_price: number;
}