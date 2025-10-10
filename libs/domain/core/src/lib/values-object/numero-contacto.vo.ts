import { DomainException } from "../errors/domain.exception";

export class NumeroContacto {
  private readonly value: string;

  constructor(value: string) {
    if (!value) throw new DomainException('El número de contacto no puede ser nulo o vacío.');

    const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(value)) {
      throw new DomainException('El número de contacto solo debe contener números.');
    }

    this.value = value;
  }

  public get Value(): string {
    return this.value;
  }

  public equals(other: NumeroContacto): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
