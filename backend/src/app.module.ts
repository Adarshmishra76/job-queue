

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsModule } from './jobs/jobs.module';
import { Job } from './jobs/job.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
     
      type: 'postgres',
      database: process.env.DATABASE_PATH || 'jobs.db',
      entities: [Job],
      synchronize: true,
       }),
    JobsModule,
  ],
})
export class AppModule {}