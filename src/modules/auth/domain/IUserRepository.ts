import { Result } from '@/shared/core/Result';

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  cpf?: string;
  enderecoPessoal?: string;
  telefone?: string;
  avatarUrl?: string;
  createdAt: Date;
}

export interface IUserRepository {
  findById(id: string): Promise<Result<UserProfile | null>>;
  update(id: string, data: Partial<Pick<UserProfile, 'nome' | 'telefone' | 'avatarUrl' | 'cpf' | 'enderecoPessoal'>>): Promise<Result<void>>;
}

