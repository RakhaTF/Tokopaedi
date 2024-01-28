import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { DeliveryStatus } from "./DeliveryStatus";
import { TransactionStatus } from "./TransactionStatus";
import { ShippingAddress } from "./ShippingAddress";
import { OrderItem } from "./OrderItem";
import { Users } from "./Users";

@Entity('transaction')
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    user_id: number

    @Column()
    shipping_address_id: number

    @Column({ type: 'varchar', length: 50, nullable: true })
    payment_method: string;

    @Column("decimal", { precision: 10, scale: 2 })
    items_price: number;

    @Column("decimal", { precision: 10, scale: 2 })
    shipping_price: number;

    @Column("decimal", { precision: 10, scale: 2 })
    total_price: number;

    @Column({ type: 'boolean', default: false })
    is_paid: boolean;

    @Column()
    paid_at: number;

    @Column()
    created_at: number;

    @Column()
    updated_at: number;

    @Column()
    expire_at: number;

    @Column({ type: 'boolean', default: false })
    is_deleted: boolean;

    @ManyToOne(() => ShippingAddress, shippingAddress => shippingAddress.id)

    @OneToOne(() => DeliveryStatus, deliveryStatus => deliveryStatus.transaction)
    delivery_status: DeliveryStatus

    @OneToOne(() => TransactionStatus, transactionStatus => transactionStatus.transaction)
    transaction_status: TransactionStatus

    @OneToMany(() => OrderItem, orderItem => orderItem.transaction)
    orderItems: OrderItem[];

    @ManyToOne(() => Users, user => user.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id', referencedColumnName: "id" })
    user: Users

    @BeforeInsert()
    calculateTotalPrice() {
        this.total_price = this.items_price + this.shipping_price
    }

    @BeforeUpdate()
    calculateTotalPriceAfterUpdate() {
        this.total_price = this.items_price + this.shipping_price
    }
}