import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sedes')
export class Sede {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 10 })
  codigo: string;

  @Column({ length: 150 })
  nombre: string;

  @Column({ nullable: true, length: 255 })
  direccion: string;

  @Column({ default: true })
  activo: boolean;
}
