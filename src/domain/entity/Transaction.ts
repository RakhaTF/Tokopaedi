import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	OneToMany,
	JoinColumn,
} from "typeorm";
import { PaymentResult } from "./PaymentResult";
import { OrderItem } from "./OrderItems";
import { User } from "./User";

@Entity()
export class Transaction {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, { nullable: false })
	@JoinColumn({ name: "user_id" })
	user: User;

	@OneToMany(() => OrderItem, (orderItem) => orderItem.order)
	order_items: OrderItem[];

	@Column()
	payment_method: string;

	@ManyToOne(() => PaymentResult, { nullable: true })
	@JoinColumn({ name: "payment_result_id" })
	payment_result: PaymentResult;

	@Column({ type: "decimal", precision: 10, scale: 2, default: 0.0 })
	items_price: number;

	@Column({ type: "decimal", precision: 10, scale: 2, default: 0.0 })
	shipping_price: number;

	@Column({ type: "decimal", precision: 10, scale: 2, default: 0.0 })
	total_price: number;

	@Column({ type: "tinyint", width: 1, default: 0 })
	is_paid: number;

	@Column({ nullable: true, type: "int", width: 10 })
	paid_at: number;

	@Column({ type: "tinyint", width: 1, default: 0 })
	is_delivered: number;

	@Column({ nullable: true, type: "int", width: 10 })
	delivered_at: number;

	@Column({ type: "int", width: 10 })
	created_at: number;

	@Column({ type: "int", width: 10 })
	updated_at: number;
}
