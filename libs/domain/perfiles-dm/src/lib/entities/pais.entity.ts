export class Pais {
  readonly id: number;
  readonly codigoIso: string;
  readonly nombre: string;
  readonly moneda: string;
  readonly simboloMoneda: string;
  readonly zonaHoraria: string;
  readonly idiomaOficial: string;
  readonly reguladorSanitario?: string | null;

  constructor(props: {
    id: number;
    codigoIso: string;
    nombre: string;
    moneda: string;
    simboloMoneda: string;
    zonaHoraria: string;
    idiomaOficial: string;
    reguladorSanitario?: string | null;
  }) {
    this.id = props.id;
    this.codigoIso = props.codigoIso;
    this.nombre = props.nombre;
    this.moneda = props.moneda;
    this.simboloMoneda = props.simboloMoneda;
    this.zonaHoraria = props.zonaHoraria;
    this.idiomaOficial = props.idiomaOficial;
    this.reguladorSanitario = props.reguladorSanitario ?? null;
  }

  toPrimitives() {
    return {
      id: this.id,
      codigoIso: this.codigoIso,
      nombre: this.nombre,
      moneda: this.moneda,
      simboloMoneda: this.simboloMoneda,
      zonaHoraria: this.zonaHoraria,
      idiomaOficial: this.idiomaOficial,
      reguladorSanitario: this.reguladorSanitario,
    };
  }
}
