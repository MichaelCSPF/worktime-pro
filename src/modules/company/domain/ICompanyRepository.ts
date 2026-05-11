import { Result } from '@/shared/core/Result';
import { Company } from './Company';
import { CompanyConfig } from './CompanyConfig';

export interface ICompanyRepository {
  /**
   * Salva uma nova empresa e seu vínculo inicial.
   */
  save(company: Company, config: CompanyConfig): Promise<Result<void>>;

  /**
   * Atualiza dados da empresa e seu vínculo.
   */
  update(company: Company, config: CompanyConfig): Promise<Result<void>>;

  /**
   * Executa soft delete na empresa.
   */
  delete(id: string): Promise<Result<void>>;

  /**
   * Busca uma empresa por ID.
   */
  findById(id: string): Promise<Result<Company | null>>;

  /**
   * Lista empresas ativas de um usuário com suas configurações.
   */
  listByUserId(userId: string): Promise<Result<Array<{ company: Company; config: CompanyConfig; bindingId: string }>>>;

  /**
   * Busca o vínculo específico entre usuário e empresa.
   */
  getBinding(userId: string, companyId: string): Promise<Result<CompanyConfig | null>>;

  /**
   * Busca uma empresa pelo ID do vínculo (f_usuario_empresa).
   */
  findByBindingId(bindingId: string): Promise<Result<Company | null>>;
}
