import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Estudiante } from '../../admision-inscripcion/entities/estudiante.entity';
import { SolicitudEgreso } from './solicitud-egreso.entity';

@Entity('titulos_emitidos')
export class TituloEmitido {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Estudiante)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;

  @OneToOne(() => SolicitudEgreso)
  @JoinColumn({ name: 'solicitud_egreso_id' })
  solicitudEgreso: SolicitudEgreso;

  @Column({ unique: true, length: 30 })
  numero_titulo: string;

  @Column({ type: 'date' })
  fecha_emision: string;
}
