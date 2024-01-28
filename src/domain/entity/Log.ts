import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Users } from "./Users";

@Entity('log')
export class Log {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column({ type: 'varchar', length: 100, nullable: false })
    action: string;

    @Column({ type: 'varchar', length: 15, nullable: false })
    ip: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    browser: string;

    @Column()
    time: number;

    @ManyToOne(() => Users, user => user.id)
    @JoinColumn({ name: 'user_id' })
    user: Users[]
}