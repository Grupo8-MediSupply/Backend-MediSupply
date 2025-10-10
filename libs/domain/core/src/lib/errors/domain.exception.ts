export class DomainException extends Error {
  override readonly name = 'DomainException';
  public readonly code?: string;
  public readonly context?: Record<string, any>;

  constructor(message: string, code?: string, context?: Record<string, any>) {
    super(message);
    this.code = code;
    this.context = context;

    // Mantiene el prototipo correcto (necesario para heredar de Error)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
