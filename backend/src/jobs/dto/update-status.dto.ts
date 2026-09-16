import { IsIn, IsNotEmpty } from 'class-validator';

const ALLOWED_STATUSES = ['pending', 'running', 'completed', 'failed'] as const;

export class UpdateStatusDto {
  @IsNotEmpty()
  @IsIn(ALLOWED_STATUSES, {
    message: `status must be one of: ${ALLOWED_STATUSES.join(', ')}`,
  })
  status: string;
}