import { Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { AuditarGraduacionUseCase } from '../aplicacion/auditar-graduacion.use-case';

@Controller('estudiantes/:estudianteId/solicitudes-egreso')
export class SolicitudesEgresoController {
  constructor(private readonly auditarGraduacion: AuditarGraduacionUseCase) {}

  @Post()
  async solicitar(@Param('estudianteId', ParseIntPipe) estudianteId: number) {
    return this.auditarGraduacion.ejecutar(estudianteId);
  }
}
