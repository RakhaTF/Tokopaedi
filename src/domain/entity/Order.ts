import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Order{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: string;

    @Column()
    description: string;

    @Column()
    price: number;

    @Column()
    stock: number;
}