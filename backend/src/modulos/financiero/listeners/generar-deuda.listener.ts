import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstudianteInscriptoASeccionPayload } from '../../admision-inscripcion/aplicacion/inscribir-estudiante-a-seccion.use-case';
import {
  CodigoConceptoArancel,
  ConceptoArancel,
} from '../entities/concepto-arancel.entity';
import { CuentaPorCobrar } from '../entities/cuenta-por-cobrar.entity';

const CANTIDAD_CUOTAS = 5;

@Injectable()
export class GenerarDeudaListener {
  private readonly logger = new Logger(GenerarDeudaListener.name);

  constructor(
    @InjectRepository(ConceptoArancel)
    private readonly conceptoArancelRepository: Repository<ConceptoArancel>,
    @InjectRepository(CuentaPorCobrar)
    private readonly cuentaPorCobrarRepository: Repository<CuentaPorCobrar>,
  ) {}

  @OnEvent('EstudianteInscriptoASeccion')
  async generarDeuda(payload: EstudianteInscriptoASeccionPayload): Promise<void> {
    const yaGenerada = await this.cuentaPorCobrarRepository.exists({
      where: {
        estudiante: { id: payload.estudianteId },
        periodoAcademico: { id: payload.periodoAcademicoId },
        concepto: { codigo: CodigoConceptoArancel.ARANCEL_CURSADA },
      },
    });

    if (yaGenerada) {
      return; // ya se generó el plan de pago para este período, no duplicar
    }

    const [matricula, arancelCursada, cuota] = await Promise.all([
      this.conceptoArancelRepository.findOneOrFail({
        where: { codigo: CodigoConceptoArancel.MATRICULA },
      }),
      this.conceptoArancelRepository.findOneOrFail({
        where: { codigo: CodigoConceptoArancel.ARANCEL_CURSADA },
      }),
      this.conceptoArancelRepository.findOneOrFail({
        where: { codigo: CodigoConceptoArancel.CUOTA },
      }),
    ]);

    const hoy = new Date();

    const cuentas = [
      this.cuentaPorCobrarRepository.create({
        estudiante: { id: payload.estudianteId },
        concepto: matricula,
        periodoAcademico: { id: payload.periodoAcademicoId },
        monto: matricula.monto_base,
        fecha_vencimiento: hoy.toISOString().slice(0, 10),
      }),
      this.cuentaPorCobrarRepository.create({
        estudiante: { id: payload.estudianteId },
        concepto: arancelCursada,
        periodoAcademico: { id: payload.periodoAcademicoId },
        monto: arancelCursada.monto_base,
        fecha_vencimiento: hoy.toISOString().slice(0, 10),
      }),
      ...Array.from({ length: CANTIDAD_CUOTAS }, (_, indice) => {
        const vencimiento = new Date(hoy);
        vencimiento.setMonth(vencimiento.getMonth() + indice + 1);
        return this.cuentaPorCobrarRepository.create({
          estudiante: { id: payload.estudianteId },
          concepto: cuota,
          periodoAcademico: { id: payload.periodoAcademicoId },
          monto: cuota.monto_base,
          fecha_vencimiento: vencimiento.toISOString().slice(0, 10),
        });
      }),
    ];

    await this.cuentaPorCobrarRepository.save(cuentas);
    this.logger.log(
      `Deuda generada para estudiante ${payload.estudianteId} en período ${payload.periodoAcademicoId}`,
    );
  }
}
