import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserGroup } from './UserGroup'; // Assuming you have a UserGroup entity
import { UserRules } from './UserRules'; // Assuming you have a UserRule entity

@Entity('user_group_rules')
export class UserGroupRules {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'smallint', nullable: true })
  group_id: number;

  @Column({ type: 'int' })
  rules_id: number;

  @ManyToOne(() => UserGroup, userGroup => userGroup.level_id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "group_id", referencedColumnName: "level_id" })
  userGroup: UserGroup;

  @ManyToOne(() => UserRules, userRules => userRules.rules_id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "rules_id", referencedColumnName: "rules_id" })
  userRule: UserRules;
}
