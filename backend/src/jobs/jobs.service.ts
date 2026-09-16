import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus } from './job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateStatusDto } from './dto/update-status.dto'
const TERMINAL: JobStatus[] = ['completed', 'failed'];

// pending -> running | failed
// running -> completed | failed
// completed/failed -> (nothing)
const TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  pending: ['running', 'failed'],
  running: ['completed', 'failed'],
  completed: [],
  failed: [],
};

@Injectable()
export class JobsService {
     constructor(
    @InjectRepository(Job)
    private readonly jobsRepo: Repository<Job>,
  ) {}

  async create(dto: CreateJobDto): Promise<Job> {
    const job = this.jobsRepo.create({
      title: dto.title.trim(),
      type: dto.type as Job['type'],
      status: 'pending',
    });
    return this.jobsRepo.save(job);
  }
   async findAll(): Promise<Job[]> {
    return this.jobsRepo.find({ order: { createdAt: 'DESC' } });
  }

  async updateStatus(id: string, dto: UpdateStatusDto): Promise<Job> {
    const job = await this.jobsRepo.findOne({ where: { id } });
    if (!job) throw new NotFoundException(`Job ${id} not found`);

    const next = dto.status as JobStatus;

    // Idempotent — setting the same status is a no-op
    if (job.status === next) return job;
    if (TERMINAL.includes(job.status)) {
      throw new ConflictException(
        `Job is in terminal state "${job.status}" and cannot transition`,
      );
    }

    if (!TRANSITIONS[job.status].includes(next)) {
      throw new BadRequestException(
        `Illegal transition: ${job.status} -> ${next}`,
      );
    }
     // Concurrency guard: re-check current status at write time.
    // Two tabs both read "pending" → both try running. Only the first
    // matches WHERE; the second gets affected = 0 and a 409.
    const result = await this.jobsRepo
      .createQueryBuilder()
      .update(Job)
      .set({ status: next })
      .where('id = :id AND status = :current', {
        id,
        current: job.status,
      })
      .execute();

    if (result.affected === 0) {
      throw new ConflictException(
         'Job status was updated concurrently, please retry',
      );
    }

    return this.jobsRepo.findOneOrFail({ where: { id } });
  }

  async remove(id: string): Promise<{ id: string }> {
    const job = await this.jobsRepo.findOne({ where: { id } });
    if (!job) throw new NotFoundException(`Job ${id} not found`);

    if (job.status === 'running') {
      throw new ConflictException('Cannot delete a running job');
       }

    await this.jobsRepo.delete(id);
    return { id };
  }
}