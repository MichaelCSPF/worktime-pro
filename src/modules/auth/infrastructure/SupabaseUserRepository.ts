import { createClient } from '@/shared/infrastructure/supabase/server';
import { IUserRepository, UserProfile } from '../domain/IUserRepository';
import { Result } from '@/shared/core/Result';


export class SupabaseUserRepository implements IUserRepository {
  async findById(id: string): Promise<Result<UserProfile | null>> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('d_usuarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return Result.ok(null);
      return Result.fail(error.message);
    }


    return Result.ok({
      id: data.id,
      nome: data.nome,
      email: data.email,
      cpf: data.cpf || undefined,
      enderecoPessoal: data.endereco_pessoal || undefined,
      telefone: data.telefone || undefined,
      avatarUrl: data.avatar_url || undefined,
      createdAt: new Date(data.created_at),
    });
  }

  async update(id: string, data: Partial<Pick<UserProfile, 'nome' | 'telefone' | 'avatarUrl' | 'cpf' | 'enderecoPessoal'>>): Promise<Result<void>> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('d_usuarios')
      .update({
        nome: data.nome,
        telefone: data.telefone,
        cpf: data.cpf,
        endereco_pessoal: data.enderecoPessoal,
        avatar_url: data.avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) return Result.fail(error.message);
    return Result.ok();
  }
}
