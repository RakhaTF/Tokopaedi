// Allowed payment method.
export type PaymentMethod = "Cash" | "Credit Card" | "Debit Card";

// You can also move the enums here if they are shared widely.
export enum TransactionStatus {
    Pending = 0,
    Approved = 1,
    Rejected = 2,
}

export enum DeliveryStatus {
    Pending = 0,
    OnDelivery = 1,
    Delivered = 2,
}
