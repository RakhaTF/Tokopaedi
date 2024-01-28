import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Transaction } from "./Transaction";
import { Product } from "./Product";

@Entity('order_item')
export class OrderItem {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    order_id: number

    @Column()
    qty: number;

    @Column()
    product_id: number;

    @ManyToOne(() => Transaction, transaction => transaction.id)
    @JoinColumn({ name: "order_id", referencedColumnName: "id"})
    transaction: Transaction

    @ManyToOne(() => Product, product => product.id)
    @JoinColumn({ name: "product_id", referencedColumnName: "id" })
    product: Product
}