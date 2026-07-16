import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Seccion } from '../../infraestructura-academica/entities/seccion.entity';

@Entity('clases')
@Unique(['seccion', 'fecha'])
export class Clase {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Seccion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seccion_id' })
  seccion: Seccion;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ nullable: true, length: 255 })
  tema: string;
}
