import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { ShippingAddress } from "./ShippingAddress";

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column()
	email: string;

	@Column()
	password: string;

	@OneToMany(() => ShippingAddress, (shippingAddress) => shippingAddress.user)
	shipping_addresses: ShippingAddress[];

	@Column({ type: "enum", enum: ["user", "admin"], default: "user" })
	role: "user" | "admin";

	@Column({ type: "int", width: 10 })
	created_at: number;
}
