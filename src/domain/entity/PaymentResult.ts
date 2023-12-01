import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class PaymentResult {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: true })
	status: string;

	@Column({ name: "update_time", nullable: true })
	update_time: string;

	@Column({ nullable: true })
	email: string;
}
