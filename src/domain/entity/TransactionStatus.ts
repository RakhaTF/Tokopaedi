import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Transaction } from "./Transaction";

@Entity('transaction_status')
export class TransactionStatus {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    transaction_id: number;

    @OneToOne(() => Transaction, transaction => transaction.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "transaction_id", referencedColumnName: "id" })
    transaction: Transaction

    @Column({ type: "smallint" })
    status: number;

    @Column()
    update_time: number;
}