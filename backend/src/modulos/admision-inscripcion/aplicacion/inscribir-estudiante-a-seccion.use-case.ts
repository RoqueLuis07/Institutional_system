import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';
import { Estudiante } from '../entities/estudiante.entity';
import { Seccion } from '../../infraestructura-academica/entities/seccion.entity';
import {
  EstadoInscripcionPeriodo,
  InscripcionPeriodo,
} from '../entities/inscripcion-periodo.entity';
import {
  EstadoInscripcionSeccion,
  InscripcionSeccion,
} from '../entities/inscripcion-seccion.entity';
import {
  ErrorNegocioInscripcion,
  ReglaValidacionInscripcion,
} from './reglas/regla-validacion-inscripcion.interface';
import { ReglaEstadoGeneral } from './reglas/regla-estado-general';
import { ReglaHabilitacionFinanciera } from './reglas/regla-habilitacion-financiera';
import { ReglaCorrelatividades } from './reglas/regla-correlatividades';
import { ReglaDuplicidadMateria } from './reglas/regla-duplicidad-materia';
import { ReglaColisionHorario } from './reglas/regla-colision-horario';

export interface EstudianteInscriptoASeccionPayload {
  estudianteId: number;
  seccionId: number;
  materiaId: number;
  periodoAcademicoId: number;
}

@Injectable()
export class InscribirEstudianteASeccionUseCase {
  private readonly reglas: ReglaValidacionInscripcion[];

  constructor(
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
    reglaEstadoGeneral: ReglaEstadoGeneral,
    reglaHabilitacionFinanciera: ReglaHabilitacionFinanciera,
    reglaCorrelatividades: ReglaCorrelatividades,
    reglaDuplicidadMateria: ReglaDuplicidadMateria,
    reglaColisionHorario: ReglaColisionHorario,
  ) {
    // Orden deliberado: las validaciones más baratas (estado, flags) van
    // primero para fallar rápido antes de las consultas más costosas.
    this.reglas = [
      reglaEstadoGeneral,
      reglaHabilitacionFinanciera,
      reglaCorrelatividades,
      reglaDuplicidadMateria,
      reglaColisionHorario,
    ];
  }

  async ejecutar(estudianteId: number, seccionId: number): Promise<InscripcionSeccion> {
    return this.dataSource.transaction(async (manager) => {
      const estudiante = await manager.findOne(Estudiante, {
        where: { id: estudianteId },
        relations: ['carrera', 'planEstudio'],
      });
      if (!estudiante) {
        throw new NotFoundException('Estudiante inexistente');
      }

      const seccion = await manager.findOne(Seccion, {
        where: { id: seccionId },
        relations: ['materia', 'periodoAcademico'],
      });
      if (!seccion) {
        throw new NotFoundException('Sección inexistente');
      }

      for (const regla of this.reglas) {
        try {
          await regla.validar({ manager, estudiante, seccion });
        } catch (error) {
          if (error instanceof ErrorNegocioInscripcion) {
            throw new BadRequestException(error.message);
          }
          throw error;
        }
      }

      // Bloqueo pesimista de la sección para serializar el chequeo de cupo
      // bajo alta concurrencia.
      const seccionBloqueada = await manager
        .createQueryBuilder(Seccion, 'seccion')
        .setLock('pessimistic_write')
        .where('seccion.id = :id', { id: seccion.id })
        .getOneOrFail();

      if (seccionBloqueada.cupo_ocupado >= seccionBloqueada.cupo_maximo) {
        throw new BadRequestException('No hay cupo disponible en la sección');
      }

      let inscripcionPeriodo = await manager.findOne(InscripcionPeriodo, {
        where: {
          estudiante: { id: estudiante.id },
          periodoAcademico: { id: seccion.periodoAcademico.id },
        },
      });

      if (!inscripcionPeriodo) {
        inscripcionPeriodo = await manager.save(
          manager.create(InscripcionPeriodo, {
            estudiante,
            periodoAcademico: seccion.periodoAcademico,
            estado: EstadoInscripcionPeriodo.ACTIVA,
          }),
        );
      }

      const inscripcionSeccion = await manager.save(
        manager.create(InscripcionSeccion, {
          inscripcionPeriodo,
          seccion,
          estado: EstadoInscripcionSeccion.INSCRIPTA,
        }),
      );

      await manager.increment(Seccion, { id: seccion.id }, 'cupo_ocupado', 1);

      const payload: EstudianteInscriptoASeccionPayload = {
        estudianteId: estudiante.id,
        seccionId: seccion.id,
        materiaId: seccion.materia.id,
        periodoAcademicoId: seccion.periodoAcademico.id,
      };
      this.eventEmitter.emit('EstudianteInscriptoASeccion', payload);

      return inscripcionSeccion;
    });
  }
}
