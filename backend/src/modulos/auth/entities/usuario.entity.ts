import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Estudiante } from '../../admision-inscripcion/entities/estudiante.entity';
import { Docente } from '../../infraestructura-academica/entities/docente.entity';

export enum RolUsuario {
  ADMIN = 'ADMIN',
  DOCENTE = 'DOCENTE',
  ESTUDIANTE = 'ESTUDIANTE',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 150 })
  email: string;

  @Column({ length: 100 })
  password_hash: string;

  @Column({ type: 'varchar', length: 20 })
  rol: RolUsuario;

  // Vínculo con el perfil según rol; un ADMIN no referencia a ninguno.
  @OneToOne(() => Estudiante, { nullable: true })
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante | null;

  @OneToOne(() => Docente, { nullable: true })
  @JoinColumn({ name: 'docente_id' })
  docente: Docente | null;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  creado_en: Date;
}
