import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Postulante } from './postulante.entity';

export enum TipoDocumentoPostulante {
  DNI = 'DNI',
  TITULO_SECUNDARIO = 'TITULO_SECUNDARIO',
  PARTIDA_NACIMIENTO = 'PARTIDA_NACIMIENTO',
  FOTO = 'FOTO',
  OTRO = 'OTRO',
}

@Entity('documentos_postulante')
export class DocumentoPostulante {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Postulante, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postulante_id' })
  postulante: Postulante;

  @Column({ type: 'varchar', length: 30 })
  tipo_documento: TipoDocumentoPostulante;

  @Column({ length: 500 })
  url_archivo: string;

  @Column({ default: false })
  verificado: boolean;

  @CreateDateColumn()
  cargado_en: Date;
}
