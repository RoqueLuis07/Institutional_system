import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from './entities';
import { InscripcionesController } from './api/inscripciones.controller';
import { EstudiantesController } from './api/estudiantes.controller';
import { InscribirEstudianteASeccionUseCase } from './aplicacion/inscribir-estudiante-a-seccion.use-case';
import { ReglaEstadoGeneral } from './aplicacion/reglas/regla-estado-general';
import { ReglaHabilitacionFinanciera } from './aplicacion/reglas/regla-habilitacion-financiera';
import { ReglaCorrelatividades } from './aplicacion/reglas/regla-correlatividades';
import { ReglaDuplicidadMateria } from './aplicacion/reglas/regla-duplicidad-materia';
import { ReglaColisionHorario } from './aplicacion/reglas/regla-colision-horario';

@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  controllers: [InscripcionesController, EstudiantesController],
  providers: [
    InscribirEstudianteASeccionUseCase,
    ReglaEstadoGeneral,
    ReglaHabilitacionFinanciera,
    ReglaCorrelatividades,
    ReglaDuplicidadMateria,
    ReglaColisionHorario,
  ],
})
export class AdmisionInscripcionModule {}
