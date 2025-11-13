import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CrearPlanVentaDto } from './dtos/request/crear-plan-venta.dto';
import { PlanVenta, IPlanesVentaRepository } from '@medi-supply/ventas-dm';
import { JwtPayloadDto } from '@medi-supply/shared';
import { PlanVentaResponseDto } from './dtos/response/plan-venta.response.dto';

@Injectable()
export class PlanesVentaService {
  constructor(
    @Inject('IPlanesVentaRepository')
    private readonly planesVentaRepository: IPlanesVentaRepository,
  ) {}

  async crearPlanVenta(
    crearPlanVentaDto: CrearPlanVentaDto,
    usuario: JwtPayloadDto,
  ): Promise<PlanVentaResponseDto> {
    const fechaInicio = this.parseFecha(crearPlanVentaDto.inicio, 'inicio');
    const fechaFin = this.parseFecha(crearPlanVentaDto.fin, 'fin');

    if (fechaFin < fechaInicio) {
      throw new BadRequestException(
        'La fecha de fin debe ser mayor o igual a la fecha de inicio.',
      );
    }

    const planVenta = new PlanVenta({
      nombre: crearPlanVentaDto.nombre,
      vendedorId: crearPlanVentaDto.vendedorId,
      montoMeta: crearPlanVentaDto.montoMeta,
      fechaInicio,
      fechaFin,
      descripcion: crearPlanVentaDto.descripcion,
      paisId: usuario.pais,
      creadoPor: usuario.sub,
    });

    const planCreado = await this.planesVentaRepository.crearPlan(planVenta);

    return new PlanVentaResponseDto(planCreado);
  }

  private parseFecha(valor: string, campo: 'inicio' | 'fin'): Date {
    const partes = valor.split('/');
    if (partes.length !== 3) {
      throw new BadRequestException(
        `La fecha de ${campo} no es válida. Usa el formato dd/mm/yyyy.`,
      );
    }

    const [diaStr, mesStr, anioStr] = partes;
    const dia = Number(diaStr);
    const mes = Number(mesStr);
    const anio = Number(anioStr);

    if (
      !Number.isInteger(dia) ||
      !Number.isInteger(mes) ||
      !Number.isInteger(anio)
    ) {
      throw new BadRequestException(
        `La fecha de ${campo} no es válida. Usa el formato dd/mm/yyyy.`,
      );
    }

    const fecha = new Date(Date.UTC(anio, mes - 1, dia));

    if (
      fecha.getUTCFullYear() !== anio ||
      fecha.getUTCMonth() !== mes - 1 ||
      fecha.getUTCDate() !== dia
    ) {
      throw new BadRequestException(
        `La fecha de ${campo} no existe en el calendario.`,
      );
    }

    return fecha;
  }
}
