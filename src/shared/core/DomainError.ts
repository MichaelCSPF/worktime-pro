/**
 * DomainError — Base para todos os erros de domínio
 *
 * Cada bounded context cria seus próprios erros estendendo esta classe.
 * Permite categorizar erros (validation, business_rule, not_found, etc.)
 * e rastrear a origem do erro para observabilidade.
 */

export type ErrorCategory =
  | 'validation'
  | 'business_rule'
  | 'not_found'
  | 'conflict'
  | 'unauthorized'
  | 'forbidden'
  | 'external_service'
  | 'infrastructure';

export abstract class DomainError extends Error {
  public readonly timestamp: Date;

  protected constructor(
    public readonly code: string,
    message: string,
    public readonly category: ErrorCategory,
    public readonly metadata?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    Object.freeze(this);
  }

  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      category: this.category,
      timestamp: this.timestamp.toISOString(),
      metadata: this.metadata,
    };
  }
}

export class BusinessError extends DomainError {
  constructor(message: string, code: string = 'BUSINESS_RULE_VIOLATION', metadata?: Record<string, unknown>) {
    super(code, message, 'business_rule', metadata);
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, code: string = 'VALIDATION_ERROR', metadata?: Record<string, unknown>) {
    super(code, message, 'validation', metadata);
  }
}

export class InfraError extends DomainError {
  constructor(message: string, code: string = 'INFRASTRUCTURE_ERROR', metadata?: Record<string, unknown>) {
    super(code, message, 'infrastructure', metadata);
  }
}
