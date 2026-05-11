/**
 * DomainEvent — Base para todos os eventos de domínio
 *
 * Eventos representam fatos que aconteceram no sistema.
 * São imutáveis e devem carregar apenas dados necessários.
 *
 * Eventos definidos no PROJECT_CONTEXT.md:
 * - ClockInRegistered
 * - ClockOutRegistered
 * - LunchStarted
 * - LunchFinished
 * - OvertimeCalculated
 * - SalaryCalculated
 * - GPSValidationFailed
 * - FraudDetected
 */

export interface DomainEvent {
  readonly eventId: string;
  readonly eventType: string;
  readonly aggregateId: string;
  readonly occurredAt: Date;
  readonly payload: Record<string, unknown>;
}

export function createDomainEvent(
  eventType: string,
  aggregateId: string,
  payload: Record<string, unknown>,
): DomainEvent {
  return Object.freeze({
    eventId: crypto.randomUUID(),
    eventType,
    aggregateId,
    occurredAt: new Date(),
    payload,
  });
}
