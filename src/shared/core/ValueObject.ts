/**
 * ValueObject — Classe base para Value Objects de domínio
 *
 * Value Objects são imutáveis e comparados por valor (atributos),
 * não por identidade. Ex: Email, GPS Coordinates, Money.
 */

export abstract class ValueObject<TProps> {
  protected readonly props: Readonly<TProps>;

  protected constructor(props: TProps) {
    this.props = Object.freeze(props);
  }

  public equals(other: ValueObject<TProps>): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
