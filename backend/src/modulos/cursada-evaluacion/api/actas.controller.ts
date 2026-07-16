import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ActaExamenFinalDetalle,
  CondicionActaExamenFinal,
} from '../entities/acta-examen-final-detalle.entity';
import { CerrarActaExamenFinalUseCase } from '../aplicacion/cerrar-acta-examen-final.use-case';

class NotaExamenDto {
  estudianteId: number;
  notaExamen: number;
}

class CargarNotasExamenDto {
  notas: NotaExamenDto[];
}

@Controller('actas')
export class ActasController {
  constructor(
    @InjectRepository(ActaExamenFinalDetalle)
    private readonly detalleRepository: Repository<ActaExamenFinalDetalle>,
    private readonly cerrarActaExamenFinal: CerrarActaExamenFinalUseCase,
  ) {}

  // Precarga de notas de examen antes del cierre del acta: el docente carga
  // la nota tomada en la mesa, y luego se dispara el cierre que consolida
  // proceso + examen y actualiza el historial académico.
  @Post(':actaId/notas-examen')
  async cargarNotasExamen(
    @Param('actaId', ParseIntPipe) actaId: number,
    @Body() dto: CargarNotasExamenDto,
  ) {
    const registros = dto.notas.map((n) =>
      this.detalleRepository.create({
        acta: { id: actaId },
        estudiante: { id: n.estudianteId },
        nota_examen: String(n.notaExamen),
        condicion: CondicionActaExamenFinal.AUSENTE,
      }),
    );
    return this.detalleRepository.upsert(registros, ['acta', 'estudiante']);
  }

  @Post(':actaId/cerrar')
  async cerrar(@Param('actaId', ParseIntPipe) actaId: number) {
    return this.cerrarActaExamenFinal.ejecutar(actaId);
  }
}
