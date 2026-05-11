import { ValueObject } from '@/shared/core/ValueObject';
import { Result } from '@/shared/core/Result';
import { ValidationError } from '@/shared/core/DomainError';


interface CoordinatesProps {
  latitude: number | null;
  longitude: number | null;
  radiusInMeters: number | null;
}

/**
 * Value Object para Coordenadas GPS e Raio de Validação.
 * 
 * Regras:
 * - Lat: [-90, 90]
 * - Lng: [-180, 180]
 * - Raio: [1, 50000] metros
 */
export class Coordinates extends ValueObject<CoordinatesProps> {
  get latitude() { return this.props.latitude; }
  get longitude() { return this.props.longitude; }
  get radiusInMeters() { return this.props.radiusInMeters; }

  private constructor(props: CoordinatesProps) {
    super(props);
  }

  public static create(props: CoordinatesProps): Result<Coordinates, ValidationError> {
    if (props.latitude !== null && (props.latitude < -90 || props.latitude > 90)) {
      return Result.fail(new ValidationError('Latitude inválida', 'INVALID_LATITUDE'));
    }

    if (props.longitude !== null && (props.longitude < -180 || props.longitude > 180)) {
      return Result.fail(new ValidationError('Longitude inválida', 'INVALID_LONGITUDE'));
    }

    if (props.radiusInMeters !== null && (props.radiusInMeters <= 0 || props.radiusInMeters > 50000)) {
      return Result.fail(new ValidationError('Raio de validação inválido (1m a 50km)', 'INVALID_RADIUS'));
    }


    return Result.ok(new Coordinates(props));
  }
}
