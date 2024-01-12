import { HelperParamsDto } from "@domain/model/params";

export function CalculateShippingPrice(params: HelperParamsDto.CalculateShippingPrice) {
    const { expedition_name, shipping_address_id } = params;

    const couriers = {
        "JNE": { packagingCost: 100, shippingCost: 200, administrationCost: 50 },
        "J&T": { packagingCost: 150, shippingCost: 250, administrationCost: 60 },
        "Tiki": { packagingCost: 100, shippingCost: 210, administrationCost: 70 },
        "Wahana": { packagingCost: 70, shippingCost: 150, administrationCost: 80 },
        "Gojek": { packagingCost: 80, shippingCost: 280, administrationCost: 50 },
        "Lion Parcel": { packagingCost: 90, shippingCost: 230, administrationCost: 50 },
        "Ninja Express": { packagingCost: 200, shippingCost: 200, administrationCost: 100 },
        "Shopee Express": { packagingCost: 300, shippingCost: 240, administrationCost: 20 }
    };

    const courier = couriers[expedition_name];

    if (!courier) {
        throw new Error(`Unknown courier: ${expedition_name}`);
    }

    return (courier.packagingCost + courier.shippingCost + courier.administrationCost) * shipping_address_id;
}

export function CalculateTotalPrice(params: HelperParamsDto.CalculateTotalPrice) {
    return parseFloat(params.items_price + params.shipping_price).toFixed(2)
}