export type GetAdminDataResult = {
    id: number;
    name: string;
    email: string;
    level?: number;
    created_at: number;
    group_rules?: string;
}

export type GetUserListResponse = {
    name: string;
    email: string;
    created_at: number;
}

export type GetUserDetailProfileResponse = {
    name: string;
    email: string;
    created_at: number;
}
export type GetAdminListQueryResult = {
    name: string;
    rights: string;
    rules_id: string;
}

export type GetAdminListResponse = {
    name: string;
    rights: string[];
    rules_id: number[];
}

export type GetRulesListResponse = {
    rules_id: number;
    rules: string;
}

export type GetUserGroupRulesResponse = {
    group_id: number;
    list_of_rules: string;
}

export type GetTransactionListResponse = {
    id: number;
    user_id: number;
    payment_method: string;
    items_price: number;
    shipping_price: number;
    total_price: number;
    shipping_address_id: number;
    is_paid: number;
    paid_at: number;
    created_at: number;
    updated_at: number;
}

export type GetUserShippingAddressResponse = {
    id: number;
    user_id: number;
    address: string;
    postal_code: string;
    city: string;
    province: string;
    country: string;
}