/**
 * Shared Core — Barrel export
 *
 * Ponto central de importação para todos os building blocks do domínio.
 * Todos os bounded contexts importam daqui, nunca diretamente dos arquivos.
 */

export { Result } from './Result';
export { DomainError } from './DomainError';
export type { ErrorCategory } from './DomainError';
export { createDomainEvent } from './DomainEvent';
export type { DomainEvent } from './DomainEvent';
export type { UseCase } from './UseCase';
export { Entity } from './Entity';
export { ValueObject } from './ValueObject';
