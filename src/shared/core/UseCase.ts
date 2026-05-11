/**
 * UseCase — Interface base para todos os casos de uso
 *
 * Segue Clean Architecture: cada use case recebe um DTO de entrada
 * e retorna um Result com o DTO de saída ou erro tipado.
 *
 * O UseCase é a fronteira entre application layer e domain layer.
 */

import { Result } from './Result';

export interface UseCase<TInput, TOutput, TError = string> {
  execute(input: TInput): Promise<Result<TOutput, TError>>;
}
