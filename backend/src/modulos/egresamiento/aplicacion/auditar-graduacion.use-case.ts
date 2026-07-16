import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { Estudiante, EstadoEstudiante } from '../../admision-inscripcion/entities/estudiante.entity';
import {
  CondicionHistorialAcademico,
  HistorialAcademico,
} from '../../admision-inscripcion/entities/historial-academico.entity';
import { PlanEstudioMateria } from '../../infraestructura-academica/entities/plan-estudio-materia.entity';
import {
  CuentaPorCobrar,
  EstadoCuentaPorCobrar,
} from '../../financiero/entities/cuenta-por-cobrar.entity';
import { SolicitudEgreso, EstadoSolicitudEgreso } from '../entities/solicitud-egreso.entity';
import {
  RequisitoEgreso,
  SolicitudEgresoRequisito,
} from '../entities/solicitud-egreso-requisito.entity';
import { HorasExtensionEstudiante } from '../entities/horas-extension-estudiante.entity';
import { TituloEmitido } from '../entities/titulo-emitido.entity';

@Injectable()
export class AuditarGraduacionUseCase {
  constructor(
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async ejecutar(estudianteId: number): Promise<SolicitudEgreso> {
    return this.dataSource.transaction(async (manager) => {
      const estudiante = await manager.findOne(Estudiante, {
        where: { id: estudianteId },
        relations: ['carrera', 'planEstudio'],
      });
      if (!estudiante) {
        throw new NotFoundException('Estudiante inexistente');
      }
      if (estudiante.estado !== EstadoEstudiante.ACTIVO) {
        throw new BadRequestException(
          'El estudiante no está en condiciones de solicitar egreso',
        );
      }

      let solicitud = manager.create(SolicitudEgreso, {
        estudiante,
        estado: EstadoSolicitudEgreso.PENDIENTE,
      });
      solicitud = await manager.save(solicitud);

      // --- Requisito 1: malla curricular 100% aprobada ---
      const materiasObligatorias = await manager.find(PlanEstudioMateria, {
        where: { planEstudio: { id: estudiante.planEstudio.id }, obligatoria: true },
        relations: ['materia'],
      });
      const aprobadas = await manager.find(HistorialAcademico, {
        where: { estudiante: { id: estudiante.id }, condicion: CondicionHistorialAcademico.APROBADA },
        relations: ['materia'],
      });
      const idsAprobadas = new Set(aprobadas.map((h) => h.materia.id));
      const faltantes = materiasObligatorias.filter((pm) => !idsAprobadas.has(pm.materia.id));
      const mallaCompleta = faltantes.length === 0;

      await manager.save(
        manager.create(SolicitudEgresoRequisito, {
          solicitudEgreso: solicitud,
          requisito: RequisitoEgreso.MALLA_COMPLETA,
          cumplido: mallaCompleta,
          detalle: mallaCompleta
            ? '100% del plan aprobado'
            : `Materias pendientes: ${faltantes.map((f) => f.materia.nombre).join(', ')}`,
        }),
      );

      // --- Requisito 2: horas de extensión / pasantías ---
      const horasRequeridas = estudiante.carrera.horas_extension_requeridas;
      const registrosHoras = await manager.find(HorasExtensionEstudiante, {
        where: { estudiante: { id: estudiante.id }, verificado: true },
      });
      const horasCumplidas = registrosHoras.reduce((acc, r) => acc + Number(r.horas), 0);
      const horasCompletas = horasCumplidas >= horasRequeridas;

      await manager.save(
        manager.create(SolicitudEgresoRequisito, {
          solicitudEgreso: solicitud,
          requisito: RequisitoEgreso.HORAS_EXTENSION,
          cumplido: horasCompletas,
          detalle: `${horasCumplidas}/${horasRequeridas} horas verificadas`,
        }),
      );

      // --- Requisito 3: saldo financiero en cero ---
      const cuentasPendientes = await manager.find(CuentaPorCobrar, {
        where: [
          { estudiante: { id: estudiante.id }, estado: EstadoCuentaPorCobrar.PENDIENTE },
          { estudiante: { id: estudiante.id }, estado: EstadoCuentaPorCobrar.VENCIDA },
        ],
      });
      const saldoCero = cuentasPendientes.length === 0;

      await manager.save(
        manager.create(SolicitudEgresoRequisito, {
          solicitudEgreso: solicitud,
          requisito: RequisitoEgreso.SALDO_FINANCIERO,
          cumplido: saldoCero,
          detalle: saldoCero
            ? 'Sin deuda pendiente'
            : `Deuda pendiente: ${cuentasPendientes.reduce((acc, c) => acc + Number(c.monto), 0)}`,
        }),
      );

      const todosCumplidos = mallaCompleta && horasCompletas && saldoCero;

      if (todosCumplidos) {
        solicitud.estado = EstadoSolicitudEgreso.APROBADA;
        solicitud.fecha_resolucion = new Date();
        await manager.save(solicitud);

        const numeroTitulo = randomUUID();
        await manager.save(
          manager.create(TituloEmitido, {
            estudiante,
            solicitudEgreso: solicitud,
            numero_titulo: numeroTitulo,
            fecha_emision: new Date().toISOString().slice(0, 10),
          }),
        );

        estudiante.estado = EstadoEstudiante.EGRESADO;
        await manager.save(estudiante);

        this.eventEmitter.emit('EstudianteEgresado', {
          estudianteId: estudiante.id,
          solicitudEgresoId: solicitud.id,
          numeroTitulo,
        });
      } else {
        solicitud.estado = EstadoSolicitudEgreso.RECHAZADA;
        solicitud.fecha_resolucion = new Date();
        await manager.save(solicitud);
      }

      return solicitud;
    });
  }
}
