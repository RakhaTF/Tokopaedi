import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('user_rules')
export class UserRules {
  @PrimaryGeneratedColumn()
  rules_id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  rules: string;
}
