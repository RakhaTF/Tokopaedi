import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { UserGroup } from './UserGroup';
import { Log } from './Log';

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  password: string;

  @Column({ type: 'smallint', nullable: false, default: 3 })
  level: number;

  @Column({ type: 'int', nullable: false })
  created_at: number;

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'varchar', length: 100 })
  email_token: string;

  @ManyToOne(() => UserGroup, userGroup => userGroup.level_id)
  @JoinColumn({ name: 'level' })
  userGroup: UserGroup;

  @OneToMany(() => Log, log => log.user)
  log: Log;
}
