import { DomainException } from "../errors/domain.exception";

export class Nombre {
  private readonly value: string;

  constructor(value: string) {
    if (!value) throw new DomainException('El nombre no puede ser nulo o vacío.');
    if (value.trim().length < 2) throw new DomainException('El nombre debe tener al menos 2 caracteres.');

    this.value = value.trim();
  }

  public get Value(): string {
    return this.value;
  }

  public equals(other: Nombre): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
