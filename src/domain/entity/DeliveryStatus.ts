import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Transaction } from "./Transaction";

@Entity('delivery_status')
export class DeliveryStatus {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "smallint" })
    status: number;

    @Column({ type: 'varchar', length: 100, nullable: false })
    expedition_name: string;

    @Column({ type: 'boolean', default: false })
    is_delivered: boolean;

    @Column()
    delivered_at: number;

    @Column()
    updated_at: number;

    @OneToOne(() => Transaction, transaction => transaction.id, { onDelete: 'CASCADE' })
    @JoinColumn()
    transaction: Transaction
}