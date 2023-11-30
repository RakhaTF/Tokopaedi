import { IsEmail } from "class-validator";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";


@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ unique: true })
    @IsEmail()
    email: string;

    @Column()
    age: number;

    @Column()
    password: string;

    @Column({
        type: 'int',
        width: 10,
    })
    createdAt: number;

    @Column({
        type: 'int',
        width: 10,
    })
    updatedAt: number;
}
