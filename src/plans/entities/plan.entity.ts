import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: ['INDIVIDUAL', 'CORPORATE', 'GYM'],
    default: 'INDIVIDUAL'
  })
  type: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  maxEmployees: number;

  @Column({ nullable: true })
  maxGymsAccess: number;

  @Column({ default: true })
  isActive: boolean;

  @Column('simple-array', { nullable: true })
  features: string[];

  @Column({ nullable: true })
  stripeProductId: string;

  @Column({ nullable: true })
  stripePriceId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
