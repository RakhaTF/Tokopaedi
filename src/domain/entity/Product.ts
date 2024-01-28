import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { OrderItem } from "./OrderItem";

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'varchar', length: 255, nullable: false })
    name: string;

    @Column({ type: 'text', nullable: false })
    description: string;

    @Column("decimal", { precision: 10, scale: 2 })
    price: number;

    @Column()
    stock: number;

    @Column({ type: 'boolean', default: false })
    is_deleted: boolean;

    @Column({ type: 'varchar', length: 150, nullable: false })
    img_src: string;

    @Column({ type: 'varchar', length: 150, nullable: false })
    public_id: string;

    @OneToMany(() => OrderItem, orderItem => orderItem.product_id)
    orderItem: OrderItem[]
}