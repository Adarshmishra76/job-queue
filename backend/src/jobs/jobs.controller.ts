import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  create(@Body() dto: CreateJobDto) {
    return this.jobsService.create(dto);
  }

  @Get()
  findAll() {
    return this.jobsService.findAll();
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.jobsService.updateStatus(id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.jobsService.remove(id);
  }
}