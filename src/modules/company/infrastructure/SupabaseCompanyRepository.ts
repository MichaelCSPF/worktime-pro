import { createClient } from '@/shared/infrastructure/supabase/server';
import { ICompanyRepository } from '../domain/ICompanyRepository';
import { Company } from '../domain/Company';
import { CompanyConfig } from '../domain/CompanyConfig';
import { Result } from '@/shared/core/Result';


import { Coordinates } from '../domain/Coordinates';

interface CompanyRow {
  id: string;
  usuario_id: string;
  nome: string;
  endereco: string | null;
  latitude: number | null;
  longitude: number | null;
  raio_metros: number | null;
  ativa: boolean;
  created_at: string;
  updated_at: string;
  f_usuario_empresa: Array<{
    id: string;
    salario_hora: number;
    jornada_minutos: number;
    almoco_minutos: number;
  }>;
}

export class SupabaseCompanyRepository implements ICompanyRepository {
  async save(company: Company, config: CompanyConfig): Promise<Result<void>> {
    const supabase = await createClient();

    // 1. Inserir empresa
    const { data: companyData, error: companyError } = await supabase
      .from('d_empresas')
      .insert({
        id: company.id,
        usuario_id: company.userId,
        nome: company.name,
        endereco: company.address,
        latitude: company.coordinates.latitude,
        longitude: company.coordinates.longitude,
        raio_metros: company.coordinates.radiusInMeters,
        ativa: company.active,
        created_at: company.createdAt.toISOString(),
        updated_at: company.updatedAt.toISOString(),
      })
      .select()
      .single();

    if (companyError) {
      return Result.fail(companyError.message);
    }


    // 2. Inserir vínculo (f_usuario_empresa)
    const { error: bindingError } = await supabase
      .from('f_usuario_empresa')
      .insert({
        usuario_id: company.userId,
        empresa_id: companyData.id,
        salario_hora: config.hourlyRate,
        jornada_minutos: config.dailyWorkMinutes,
        almoco_minutos: config.lunchMinutes,
      });

    if (bindingError) {
      return Result.fail(bindingError.message);
    }

    return Result.ok();
  }

  async update(company: Company, config: CompanyConfig): Promise<Result<void>> {
    const supabase = await createClient();

    // 1. Atualizar empresa
    const { error: companyError } = await supabase
      .from('d_empresas')
      .update({
        nome: company.name,
        endereco: company.address,
        latitude: company.coordinates.latitude,
        longitude: company.coordinates.longitude,
        raio_metros: company.coordinates.radiusInMeters,
        ativa: company.active,
        updated_at: company.updatedAt.toISOString(),
      })
      .eq('id', company.id);

    if (companyError) {
      return Result.fail(companyError.message);
    }

    // 2. Atualizar vínculo
    const { error: bindingError } = await supabase
      .from('f_usuario_empresa')
      .update({
        salario_hora: config.hourlyRate,
        jornada_minutos: config.dailyWorkMinutes,
        almoco_minutos: config.lunchMinutes,
        updated_at: new Date().toISOString(),
      })
      .eq('usuario_id', company.userId)
      .eq('empresa_id', company.id);

    if (bindingError) {
      return Result.fail(bindingError.message);
    }

    return Result.ok();
  }

  async delete(id: string): Promise<Result<void>> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('d_empresas')
      .update({ 
        deleted_at: new Date().toISOString(),
        ativa: false 
      })
      .eq('id', id);

    if (error) {
      return Result.fail(error.message);
    }

    return Result.ok();
  }

  async findById(id: string): Promise<Result<Company | null>> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('d_empresas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return Result.ok(null);
      return Result.fail(error.message);
    }

    const coords = Coordinates.create({
      latitude: data.latitude,
      longitude: data.longitude,
      radiusInMeters: data.raio_metros
    }).getValue();

    const company = Company.create({
      userId: data.usuario_id,
      name: data.nome,
      address: data.endereco,
      coordinates: coords,
      active: data.ativa,
      deletedAt: data.deleted_at ? new Date(data.deleted_at) : null,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }, data.id).getValue();

    return Result.ok(company);
  }

  async listByUserId(userId: string): Promise<Result<Array<{ company: Company; config: CompanyConfig; bindingId: string }>>> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('d_empresas')
      .select(`
        *,
        f_usuario_empresa (
          id,
          salario_hora,
          jornada_minutos,
          almoco_minutos
        )
      `)
      .eq('usuario_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      return Result.fail(error.message);
    }

    const results = data.map((item: CompanyRow) => {
      const coords = Coordinates.create({
        latitude: item.latitude,
        longitude: item.longitude,
        radiusInMeters: item.raio_metros
      }).getValue();

      const company = Company.create({
        userId: item.usuario_id,
        name: item.nome,
        address: item.endereco,
        coordinates: coords,
        active: item.ativa,
        deletedAt: null,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }, item.id).getValue();

      const binding = item.f_usuario_empresa[0];
      const config = CompanyConfig.create({
        hourlyRate: Number(binding.salario_hora),
        dailyWorkMinutes: Number(binding.jornada_minutos),
        lunchMinutes: Number(binding.almoco_minutos)
      }).getValue();

      return { company, config, bindingId: binding.id };
    });

    return Result.ok(results);
  }

  async getBinding(userId: string, companyId: string): Promise<Result<CompanyConfig | null>> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('f_usuario_empresa')
      .select('*')
      .eq('usuario_id', userId)
      .eq('empresa_id', companyId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return Result.ok(null);
      return Result.fail(error.message);
    }


    const config = CompanyConfig.create({
      hourlyRate: Number(data.salario_hora),
      dailyWorkMinutes: Number(data.jornada_minutos),
      lunchMinutes: Number(data.almoco_minutos)
    }).getValue();

    return Result.ok(config);
  }

  async findByBindingId(bindingId: string): Promise<Result<Company | null>> {
    const supabase = await createClient();
    
    // Busca a empresa através de um join com o vínculo
    const { data, error } = await supabase
      .from('f_usuario_empresa')
      .select('empresa_id, d_empresas(*)')
      .eq('id', bindingId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return Result.ok(null);
      return Result.fail(error.message);
    }

    const companyData = data.d_empresas as unknown as CompanyRow;
    if (!companyData) return Result.ok(null);

    const coords = Coordinates.create({
      latitude: companyData.latitude,
      longitude: companyData.longitude,
      radiusInMeters: companyData.raio_metros
    }).getValue();

    const company = Company.create({
      userId: companyData.usuario_id,
      name: companyData.nome,
      address: companyData.endereco,
      coordinates: coords,
      active: companyData.ativa,
      deletedAt: companyData.created_at ? null : null, // Simplificado para o DTO
      createdAt: new Date(companyData.created_at),
      updatedAt: new Date(companyData.updated_at),
    }, companyData.id).getValue();

    return Result.ok(company);
  }
}
