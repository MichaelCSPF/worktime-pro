import { createClient } from '@/shared/infrastructure/supabase/server';
import { IAuditRepository, AuditLogProps } from '../domain/IAuditRepository';
import { Result } from '@/shared/core/Result';


export class SupabaseAuditRepository implements IAuditRepository {
  async save(log: AuditLogProps): Promise<Result<void>> {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('d_audit_log')
      .insert({
        usuario_id: log.userId,
        acao: log.action,
        entidade: log.entity,
        entidade_id: log.entityId,
        detalhes: log.details,
        ip_address: log.ipAddress,
        user_agent: log.userAgent,
      });

    if (error) return Result.fail(error.message);
    return Result.ok();
  }
}
