/**
 * Result Pattern — Tratamento de erros sem exceções
 *
 * Inspirado no padrão Result/Either de linguagens funcionais.
 * Garante que erros sejam tratados explicitamente pelo chamador,
 * eliminando exceções não capturadas e melhorando a rastreabilidade.
 *
 * Uso:
 *   const result = await useCase.execute(input);
 *   if (result.isFailure()) {
 *     // tratar erro tipado
 *   }
 *   const value = result.getValue();
 */

export class Result<T, E = string> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _value?: T,
    private readonly _error?: E,
  ) {
    if (_isSuccess && _error !== undefined) {
      throw new Error('Result: Sucesso não pode conter erro');
    }
    if (!_isSuccess && _value !== undefined) {
      throw new Error('Result: Falha não pode conter valor');
    }
    if (!_isSuccess && _error === undefined) {
      throw new Error('Result: Falha deve conter erro');
    }

    Object.freeze(this);
  }

  public isSuccess(): boolean {
    return this._isSuccess;
  }

  public isFailure(): boolean {
    return !this._isSuccess;
  }

  public getValue(): T {
    if (!this._isSuccess) {
      throw new Error('Result: Não é possível obter valor de um resultado de falha');
    }
    return this._value as T;
  }

  public getError(): E {
    if (this._isSuccess) {
      throw new Error('Result: Não é possível obter erro de um resultado de sucesso');
    }
    return this._error as E;
  }

  public static ok<T, E = string>(value?: T): Result<T, E> {
    return new Result<T, E>(true, value, undefined);
  }

  public static fail<T, E = string>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }
}
