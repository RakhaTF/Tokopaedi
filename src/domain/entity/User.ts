import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { ShippingAddress } from "./ShippingAddress";

export type UserRole = "user" | "admin"

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
	role: UserRole

	@Column({ type: "int", width: 10 })
	created_at: number;
}
