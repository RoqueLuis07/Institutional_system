import { Body, Controller, Post } from '@nestjs/common';
import { IsInt } from 'class-validator';
import { InscribirEstudianteASeccionUseCase } from '../aplicacion/inscribir-estudiante-a-seccion.use-case';

class InscribirSeccionDto {
  @IsInt()
  estudianteId: number;

  @IsInt()
  seccionId: number;
}

@Controller('inscripciones')
export class InscripcionesController {
  constructor(private readonly inscribirEstudianteASeccion: InscribirEstudianteASeccionUseCase) {}

  @Post()
  async inscribirASeccion(@Body() dto: InscribirSeccionDto) {
    return this.inscribirEstudianteASeccion.ejecutar(dto.estudianteId, dto.seccionId);
  }
}
