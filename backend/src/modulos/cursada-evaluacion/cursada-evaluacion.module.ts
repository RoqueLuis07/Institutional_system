import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from './entities';
import { HistorialAcademico } from '../admision-inscripcion/entities/historial-academico.entity';
import { InscripcionSeccion } from '../admision-inscripcion/entities/inscripcion-seccion.entity';
import { AsistenciasController } from './api/asistencias.controller';
import { CalificacionesController } from './api/calificaciones.controller';
import { ActasController } from './api/actas.controller';
import { CerrarActaExamenFinalUseCase } from './aplicacion/cerrar-acta-examen-final.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([...entities, HistorialAcademico, InscripcionSeccion])],
  controllers: [AsistenciasController, CalificacionesController, ActasController],
  providers: [CerrarActaExamenFinalUseCase],
})
export class CursadaEvaluacionModule {}
