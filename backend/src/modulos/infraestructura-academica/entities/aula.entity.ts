import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Sede } from './sede.entity';

export enum TipoAula {
  FISICA = 'FISICA',
  VIRTUAL = 'VIRTUAL',
}

@Entity('aulas')
export class Aula {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Sede, { nullable: true })
  @JoinColumn({ name: 'sede_id' })
  sede: Sede | null;

  @Column({ length: 50 })
  nombre: string;

  @Column({ type: 'varchar', length: 10 })
  tipo: TipoAula;

  @Column({ type: 'smallint' })
  capacidad: number;
}
