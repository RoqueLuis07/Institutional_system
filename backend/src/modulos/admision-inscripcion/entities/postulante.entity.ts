import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Carrera } from '../../infraestructura-academica/entities/carrera.entity';

export enum EstadoPostulante {
  PENDIENTE = 'PENDIENTE',
  EN_REVISION = 'EN_REVISION',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
}

@Entity('postulantes')
export class Postulante {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 20 })
  documento: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100 })
  apellido: string;

  @Column({ unique: true, length: 150 })
  email: string;

  @Column({ nullable: true, length: 30 })
  telefono: string;

  @Column({ type: 'date' })
  fecha_nacimiento: string;

  @ManyToOne(() => Carrera)
  @JoinColumn({ name: 'carrera_id' })
  carrera: Carrera;

  @Column({
    type: 'varchar',
    length: 20,
    default: EstadoPostulante.PENDIENTE,
  })
  estado: EstadoPostulante;

  @CreateDateColumn()
  creado_en: Date;
}
