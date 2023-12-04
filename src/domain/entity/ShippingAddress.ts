import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class ShippingAddress {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user.shipping_addresses)
	@JoinColumn({ name: "user_id" })
	user: User;

	@Column()
	address: string;

	@Column()
	city: string;

	@Column({ name: "postal_code" })
	postal_code: string;

	@Column()
	country: string;
}
