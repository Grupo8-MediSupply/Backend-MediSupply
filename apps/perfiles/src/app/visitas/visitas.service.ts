import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { IVisitaRepository } from '@medi-supply/perfiles-dm';
import { VisitaCliente, EstadoVisita } from '@medi-supply/perfiles-dm';
import { CreateVisitaDto } from './dtos/request/create-visita.dto';
import { RolesEnum, type JwtPayloadDto } from '@medi-supply/shared';
import { ClientesService } from '../clientes/clientes.service';
import { GcpStorageService } from '@medi-supply/storage-service';

@Injectable()
export class VisitasService {
  constructor(
    @Inject('IVisitaRepository')
    private readonly visitaRepo: IVisitaRepository,
    private readonly clientesService: ClientesService,
    private readonly gcpStorage: GcpStorageService
  ) {}

  async registrarVisita(visitaDto: CreateVisitaDto, user: JwtPayloadDto) {
    if (visitaDto.fechaVisita < new Date()) {
      throw new BadRequestException('La fecha debe ser futura');
    }

    // Verificar que el cliente exista
    await this.clientesService.findById(visitaDto.clienteId);

    const props = {
      clienteId: visitaDto.clienteId,
      vendedorId: user.sub,
      fechaVisita: visitaDto.fechaVisita,
      estado: EstadoVisita.PROGRAMADA,
      comentarios: visitaDto.comentarios,
    };

    const nuevaVisita = new VisitaCliente(props);

    return this.visitaRepo.create(nuevaVisita);
  }

  async cambiarEstado(id: string, estado: EstadoVisita) {
    return this.visitaRepo.updateEstado(id, estado);
  }

  async agregarComentario(id: string, comentario: string) {
    return this.visitaRepo.addComentario(id, comentario);
  }

  async listarPorCliente(clienteId: string) {
    return this.visitaRepo.findByCliente(clienteId);
  }

  async cargarVideoVisita(
    idVisita: string,
    buffer: Buffer,
    mimetype: string,
    originalName: string,
    jwt: JwtPayloadDto
  ): Promise<string> {
    const visita = await this.visitaRepo.findById(idVisita);

    if (!visita) {
      throw new NotFoundException('La visita no existe');
    }

    // Verificación de permisos
    const isAdmin = jwt.role === RolesEnum.ADMIN;
    const isOwner = visita.vendedorId === jwt.sub;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        'No tienes permisos para modificar esta visita'
      );
    }

    const gcp_info = await this.gcpStorage.uploadBuffer(
      buffer,
      mimetype,
      originalName
    );

    await this.visitaRepo.updateEvidenciaVideo(idVisita, gcp_info.objectUrl);

    return gcp_info.signedUrl;
  }
}
