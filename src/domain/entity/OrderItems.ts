import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
} from "typeorm";
import { Transaction } from "./Transaction";
import { Product } from "./Product";

@Entity()
export class OrderItem {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Transaction, (order) => order.order_items, { nullable: false })
	@JoinColumn({ name: "order_id" })
	order: Transaction;

	@Column()
	name: string;

	@Column()
	qty: number;

	@Column({ type: "decimal", precision: 10, scale: 2 })
	price: number;

	@ManyToOne(() => Product, { nullable: false })
	@JoinColumn({ name: "product_id" })
	product: Product;
}
