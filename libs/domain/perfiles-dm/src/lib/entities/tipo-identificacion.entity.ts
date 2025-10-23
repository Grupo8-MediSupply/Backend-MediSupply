export class TipoIdentificacion {
  readonly id: number;
  readonly nombre: string;          // ← mapeado desde "descripcion"
  readonly abreviatura: string;     // ← mapeado desde "codigo"
  readonly paisId: number;

  constructor(props: { id: number; nombre: string; abreviatura: string; paisId: number }) {
    this.id = props.id;
    this.nombre = props.nombre;
    this.abreviatura = props.abreviatura;
    this.paisId = props.paisId;
  }

  toPrimitives() {
    return {
      id: this.id,
      nombre: this.nombre,
      abreviatura: this.abreviatura,
      paisId: this.paisId,
    };
  }
}
