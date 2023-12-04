import { IsEmail } from "class-validator";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";


@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column({ unique: true })
    @IsEmail()
    email: string;

    @Column()
    password: string;

    @Column()
    address: string;

    @Column()
    role: string;

    @Column({
        type: 'int',
        width: 10,
    })
    createdAt: number;
}
