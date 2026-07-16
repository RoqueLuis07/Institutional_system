import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('materias')
export class Materia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 20 })
  codigo: string;

  @Column({ length: 150 })
  nombre: string;

  @Column({ type: 'smallint' })
  creditos: number;

  @Column({ type: 'smallint' })
  horas_semanales: number;

  @Column({ default: true })
  activo: boolean;
}
