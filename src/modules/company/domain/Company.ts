import { Entity } from '@/shared/core/Entity';
import { Result } from '@/shared/core/Result';
import { ValidationError } from '@/shared/core/DomainError';

import { Coordinates } from './Coordinates';

interface CompanyProps {
  userId: string;
  name: string;
  address: string | null;
  coordinates: Coordinates;
  active: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entidade Empresa (d_empresas).
 */
export class Company extends Entity<CompanyProps> {
  get userId() { return this.props.userId; }
  get name() { return this.props.name; }
  get address() { return this.props.address; }
  get coordinates() { return this.props.coordinates; }
  get active() { return this.props.active; }
  get deletedAt() { return this.props.deletedAt; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  private constructor(props: CompanyProps, id?: string) {
    super(props, id);
  }

  public static create(props: Partial<CompanyProps> & { userId: string; name: string }, id?: string): Result<Company, ValidationError> {
    if (!props.name || props.name.length < 2) {
      return Result.fail(new ValidationError('Nome da empresa muito curto', 'COMPANY_NAME_TOO_SHORT'));
    }

    const company = new Company({
      userId: props.userId,
      name: props.name,
      address: props.address ?? null,
      coordinates: props.coordinates ?? Coordinates.create({ latitude: null, longitude: null, radiusInMeters: null }).getValue(),
      active: props.active ?? true,
      deletedAt: props.deletedAt ?? null,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    }, id);

    return Result.ok(company);
  }

  public update(props: Partial<Pick<CompanyProps, 'name' | 'address' | 'coordinates' | 'active'>>): void {
    this.props.name = props.name ?? this.props.name;
    this.props.address = props.address ?? this.props.address;
    this.props.coordinates = props.coordinates ?? this.props.coordinates;
    this.props.active = props.active ?? this.props.active;
    this.props.updatedAt = new Date();
  }

  public delete(): void {
    this.props.deletedAt = new Date();
    this.props.active = false;
    this.props.updatedAt = new Date();
  }
}
