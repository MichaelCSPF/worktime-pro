import { Result } from '@/shared/core/Result';

export interface AuditLogProps {
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface IAuditRepository {
  save(log: AuditLogProps): Promise<Result<void>>;
}
