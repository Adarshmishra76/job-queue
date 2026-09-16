import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';
export type JobType = 'email' | 'report' | 'sync' | 'cleanup';
@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  type: JobType;

  @Column({ type: 'text', default: 'pending' })
  status: JobStatus;

  @CreateDateColumn()
  createdAt: Date;
  }