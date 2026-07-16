import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalificacionInstrumento } from '../entities/calificacion-instrumento.entity';

class CalificacionDto {
  estudianteId: number;
  nota: number;
}

class RegistrarCalificacionesDto {
  calificaciones: CalificacionDto[];
}

@Controller('instrumentos/:instrumentoId/calificaciones')
export class CalificacionesController {
  constructor(
    @InjectRepository(CalificacionInstrumento)
    private readonly calificacionRepository: Repository<CalificacionInstrumento>,
  ) {}

  @Post()
  async registrar(
    @Param('instrumentoId', ParseIntPipe) instrumentoId: number,
    @Body() dto: RegistrarCalificacionesDto,
  ) {
    const registros = dto.calificaciones.map((c) =>
      this.calificacionRepository.create({
        instrumento: { id: instrumentoId },
        estudiante: { id: c.estudianteId },
        nota: String(c.nota),
      }),
    );

    return this.calificacionRepository.upsert(registros, ['instrumento', 'estudiante']);
  }
}
