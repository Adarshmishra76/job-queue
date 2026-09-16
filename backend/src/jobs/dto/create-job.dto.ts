import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

const ALLOWED_TYPES = ['email', 'report', 'sync', 'cleanup'] as const;

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsIn(ALLOWED_TYPES, {
    message: `type must be one of: ${ALLOWED_TYPES.join(', ')}`,
  })
   type: string;
}