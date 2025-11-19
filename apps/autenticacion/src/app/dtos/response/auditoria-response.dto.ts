import { NivelSeveridad } from '@medi-supply/perfiles-dm';

export class AuditoriaResponseDto {
  id: string;
  accion: string;
  modulo?: string;
  severidad: NivelSeveridad;
  usuario?: string;
  email?: string;
  ip: string;
  fecha: Date;
  detalles: any;
}
