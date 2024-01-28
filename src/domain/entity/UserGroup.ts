import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Users } from './Users'; 
import { UserGroupRules } from './UserGroupRules';

@Entity('user_groups')
export class UserGroup  {
  @PrimaryGeneratedColumn()
  level_id: number;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  group_name: string;

  @OneToMany(() => Users, user => user.userGroup)
  users: Users[];

  @OneToMany(() => UserGroupRules, userGroupRule => userGroupRule.group_id)
  userGroupRule: UserGroupRules[]
}
