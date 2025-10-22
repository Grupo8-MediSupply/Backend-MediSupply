export class Bodega {
  readonly id: string;
  readonly paisId: number;
  readonly nombre: string;
  readonly ubicacion: string;
  readonly capacidad: number;
  readonly responsable: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly estado: boolean;

  constructor(props: {
    id: string;
    paisId: number;
    nombre: string;
    ubicacion: string;
    capacidad: number;
    responsable: string;
    createdAt: Date;
    updatedAt: Date;
    estado: boolean;
  }) {
    this.id = props.id;
    this.paisId = props.paisId;
    this.nombre = props.nombre;
    this.ubicacion = props.ubicacion;
    this.capacidad = props.capacidad;
    this.responsable = props.responsable;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.estado = props.estado;
  }

  toPrimitives() {
    return {
      id: this.id,
      paisId: this.paisId,
      nombre: this.nombre,
      ubicacion: this.ubicacion,
      capacidad: this.capacidad,
      responsable: this.responsable,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      estado: this.estado,
    };
  }
}
