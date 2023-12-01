import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Product {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column("text", { nullable: true })
	description: string;

	@Column("decimal", { precision: 10, scale: 2 })
	price: number;

	@Column()
	stock: number;
}
