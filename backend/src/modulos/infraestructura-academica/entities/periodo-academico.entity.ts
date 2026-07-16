import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum EstadoPeriodoAcademico {
  PLANIFICACION = 'PLANIFICACION',
  INSCRIPCION_ABIERTA = 'INSCRIPCION_ABIERTA',
  EN_CURSO = 'EN_CURSO',
  CERRADO = 'CERRADO',
}

@Entity('periodos_academicos')
export class PeriodoAcademico {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  nombre: string;

  @Column({ type: 'date' })
  fecha_inicio: string;

  @Column({ type: 'date' })
  fecha_fin: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: EstadoPeriodoAcademico.PLANIFICACION,
  })
  estado: EstadoPeriodoAcademico;
}
