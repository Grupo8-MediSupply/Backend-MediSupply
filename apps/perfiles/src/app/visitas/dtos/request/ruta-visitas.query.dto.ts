import { IsDateString } from 'class-validator';

export class RutaVisitasQueryDto {
  @IsDateString({}, { message: 'La fecha debe estar en formato ISO 8601' })
  fecha!: string;
}
