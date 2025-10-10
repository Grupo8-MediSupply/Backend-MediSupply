import { DomainException } from "../errors/domain.exception";

export class Email {
  private readonly value: string;

  constructor(value: string) {
    if (!value) throw new Error('El email no puede ser nulo o vacío.');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new DomainException(`El email "${value}" no tiene un formato válido.`);
    }

    this.value = value.toLowerCase();
  }

  public get Value(): string {
    return this.value;
  }

  public equals(other: Email): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
