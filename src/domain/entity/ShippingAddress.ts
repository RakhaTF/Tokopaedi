import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Users } from "./Users";
import { Transaction } from "./Transaction";

@Entity('shipping_address')
export class ShippingAddress {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    address: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    postal_code: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    city: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    province: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    country: string;

    @Column({ type: 'boolean', default: false })
    is_deleted: boolean;

    @ManyToOne(() => Users, user => user.id, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: Users;

    @OneToMany(() => Transaction, transaction => transaction.shipping_address_id)
    transaction: Transaction[]
}