import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from './entities';
import { Estudiante } from '../admision-inscripcion/entities/estudiante.entity';
import { HistorialAcademico } from '../admision-inscripcion/entities/historial-academico.entity';
import { PlanEstudioMateria } from '../infraestructura-academica/entities/plan-estudio-materia.entity';
import { CuentaPorCobrar } from '../financiero/entities/cuenta-por-cobrar.entity';
import { AuditarGraduacionUseCase } from './aplicacion/auditar-graduacion.use-case';
import { SolicitudesEgresoController } from './api/solicitudes-egreso.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ...entities,
      Estudiante,
      HistorialAcademico,
      PlanEstudioMateria,
      CuentaPorCobrar,
    ]),
  ],
  controllers: [SolicitudesEgresoController],
  providers: [AuditarGraduacionUseCase],
})
export class EgresamientoModule {}
