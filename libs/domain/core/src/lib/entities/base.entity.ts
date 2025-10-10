export abstract class BaseEntity<TId = string> {
  readonly id: TId;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  protected constructor(props: {
    id: TId;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  equals(entity?: BaseEntity<TId>): boolean {
    if (entity == null) return false;
    if (this === entity) return true;
    return this.id === entity.id;
  }

  /**
   * Devuelve una copia con updatedAt actualizado.
   * Ideal para operaciones tipo "update" en tus repositorios.
   */
  touch(): this {
    (this as any).updatedAt = new Date();
    return this;
  }
}
