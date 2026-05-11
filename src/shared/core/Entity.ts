/**
 * Entity — Classe base para todas as entidades de domínio
 *
 * Entidades possuem identidade (id) e são comparadas por identidade,
 * não por atributos. Carregam eventos de domínio que são coletados
 * pelo repositório ao persistir.
 */

import { DomainEvent } from './DomainEvent';

export abstract class Entity<TProps> {
  protected readonly _id: string;
  protected readonly props: TProps;
  private _domainEvents: DomainEvent[] = [];

  protected constructor(props: TProps, id?: string) {
    this._id = id ?? crypto.randomUUID();
    this.props = props;
  }

  get id(): string {
    return this._id;
  }

  get domainEvents(): ReadonlyArray<DomainEvent> {
    return [...this._domainEvents];
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  public clearEvents(): void {
    this._domainEvents = [];
  }

  public equals(other: Entity<TProps>): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return this._id === other._id;
  }
}
