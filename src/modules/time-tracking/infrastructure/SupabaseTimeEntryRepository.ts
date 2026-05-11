import { createClient } from '@/shared/infrastructure/supabase/server';
import { ITimeEntryRepository } from '../domain/ITimeEntryRepository';
import { TimeEntry } from '../domain/TimeEntry';
import { Result } from '@/shared/core/Result';

interface PontoRow {
  id: string;
  usuario_empresa_id: string;
  entrada: string;
  almoco_inicio: string | null;
  almoco_fim: string | null;
  saida: string | null;
  latitude_entrada: number | null;
  longitude_entrada: number | null;
  precisao_gps_entrada: number | null;
  latitude_saida: number | null;
  longitude_saida: number | null;
  precisao_gps_saida: number | null;
  timezone: string;
  is_overtime_100: boolean;
  origem: 'app' | 'manual' | 'offline_sync';
  created_at: string;
  updated_at: string;
}

export class SupabaseTimeEntryRepository implements ITimeEntryRepository {
  async save(entry: TimeEntry): Promise<Result<void>> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('f_ponto')
      .insert({
        id: entry.id,
        usuario_empresa_id: entry.userCompanyId,
        entrada: entry.entry.toISOString(),
        almoco_inicio: entry.lunchStart?.toISOString(),
        almoco_fim: entry.lunchEnd?.toISOString(),
        saida: entry.exit?.toISOString(),
        latitude_entrada: entry.entryCoordinates?.latitude,
        longitude_entrada: entry.entryCoordinates?.longitude,
        precisao_gps_entrada: entry.entryCoordinates?.accuracy,
        latitude_saida: entry.exitCoordinates?.latitude,
        longitude_saida: entry.exitCoordinates?.longitude,
        precisao_gps_saida: entry.exitCoordinates?.accuracy,
        timezone: entry.timezone,
        is_overtime_100: entry.isOvertime100,
        origem: entry.source,
        created_at: entry.createdAt.toISOString(),
        updated_at: entry.updatedAt.toISOString(),
      });

    if (error) return Result.fail(error.message);
    return Result.ok();
  }

  async update(entry: TimeEntry): Promise<Result<void>> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('f_ponto')
      .update({
        almoco_inicio: entry.lunchStart?.toISOString(),
        almoco_fim: entry.lunchEnd?.toISOString(),
        saida: entry.exit?.toISOString(),
        latitude_saida: entry.exitCoordinates?.latitude,
        longitude_saida: entry.exitCoordinates?.longitude,
        precisao_gps_saida: entry.exitCoordinates?.accuracy,
        is_overtime_100: entry.isOvertime100,
        origem: entry.source,
        updated_at: entry.updatedAt.toISOString(),
      })
      .eq('id', entry.id);

    if (error) return Result.fail(error.message);
    return Result.ok();
  }

  async findById(id: string): Promise<Result<TimeEntry | null>> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('f_ponto')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return Result.ok(null);
      return Result.fail(error.message);
    }

    return Result.ok(this.mapToDomain(data as PontoRow));
  }

  async findActiveByUserId(userId: string): Promise<Result<TimeEntry | null>> {
    const supabase = await createClient();
    
    // Busca o ponto mais recente que não tem saída registrada
    // Vinculado a qualquer empresa do usuário
    const { data, error } = await supabase
      .from('f_ponto')
      .select('*, f_usuario_empresa!inner(usuario_id)')
      .eq('f_usuario_empresa.usuario_id', userId)
      .is('saida', null)
      .order('entrada', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) return Result.fail(error.message);
    if (!data) return Result.ok(null);

    return Result.ok(this.mapToDomain(data as PontoRow));
  }

  async findByUserIdAndDate(userId: string, date: Date): Promise<Result<TimeEntry[]>> {
    const supabase = await createClient();
    const startOfDay = new Date(date.setHours(0,0,0,0)).toISOString();
    const endOfDay = new Date(date.setHours(23,59,59,999)).toISOString();

    const { data, error } = await supabase
      .from('f_ponto')
      .select('*, f_usuario_empresa!inner(usuario_id)')
      .eq('f_usuario_empresa.usuario_id', userId)
      .gte('entrada', startOfDay)
      .lte('entrada', endOfDay)
      .order('entrada', { ascending: true });

    if (error) return Result.fail(error.message);
    
    return Result.ok((data as PontoRow[]).map((d) => this.mapToDomain(d)));
  }

  async findByUserIdAndMonth(userId: string, month: number, year: number, companyId?: string): Promise<Result<TimeEntry[]>> {
    const supabase = await createClient();
    
    // month is 1-indexed (1 = Jan, 12 = Dec)
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59, 999).toISOString();

    let query = supabase
      .from('f_ponto')
      .select('*, f_usuario_empresa!inner(usuario_id)')
      .eq('f_usuario_empresa.usuario_id', userId)
      .gte('entrada', startDate)
      .lte('entrada', endDate);

    if (companyId) {
      query = query.eq('usuario_empresa_id', companyId);
    }

    const { data, error } = await query.order('entrada', { ascending: false });

    if (error) return Result.fail(error.message);
    
    return Result.ok((data as PontoRow[]).map((d) => this.mapToDomain(d)));
  }

  private mapToDomain(data: PontoRow): TimeEntry {
    return TimeEntry.create({
      userCompanyId: data.usuario_empresa_id,
      entry: new Date(data.entrada),
      lunchStart: data.almoco_inicio ? new Date(data.almoco_inicio) : null,
      lunchEnd: data.almoco_fim ? new Date(data.almoco_fim) : null,
      exit: data.saida ? new Date(data.saida) : null,
      entryCoordinates: data.latitude_entrada ? {
        latitude: Number(data.latitude_entrada),
        longitude: Number(data.longitude_entrada),
        accuracy: Number(data.precisao_gps_entrada)
      } : null,
      exitCoordinates: data.latitude_saida ? {
        latitude: Number(data.latitude_saida),
        longitude: Number(data.longitude_saida),
        accuracy: Number(data.precisao_gps_saida)
      } : null,
      timezone: data.timezone,
      isOvertime100: data.is_overtime_100 ?? false,
      source: data.origem,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }, data.id).getValue();
  }
}
