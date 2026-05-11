/**
 * Entity — Testes unitários
 */

import { describe, it, expect } from 'vitest';
import { Entity } from '@/shared/core/Entity';
import { createDomainEvent } from '@/shared/core/DomainEvent';

interface TestProps {
  name: string;
}

class TestEntity extends Entity<TestProps> {
  constructor(props: TestProps, id?: string) {
    super(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  public emitEvent(): void {
    this.addDomainEvent(
      createDomainEvent('TestEvent', this.id, { name: this.props.name }),
    );
  }
}

describe('Entity', () => {
  it('deve comparar por identidade', () => {
    const entity1 = new TestEntity({ name: 'A' }, '1');
    const entity2 = new TestEntity({ name: 'B' }, '1');
    const entity3 = new TestEntity({ name: 'A' }, '2');

    expect(entity1.equals(entity2)).toBe(true);
    expect(entity1.equals(entity3)).toBe(false);
  });

  it('deve coletar domain events', () => {
    const entity = new TestEntity('1', { name: 'Test' });

    entity.emitEvent();

    expect(entity.domainEvents).toHaveLength(1);
    expect(entity.domainEvents[0].eventType).toBe('TestEvent');
  });

  it('deve limpar events', () => {
    const entity = new TestEntity('1', { name: 'Test' });

    entity.emitEvent();
    entity.clearEvents();

    expect(entity.domainEvents).toHaveLength(0);
  });
});
