import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CuentaPorCobrar } from './cuenta-por-cobrar.entity';

export enum MedioPago {
  EFECTIVO = 'EFECTIVO',
  TARJETA = 'TARJETA',
  TRANSFERENCIA = 'TRANSFERENCIA',
  OTRO = 'OTRO',
}

@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CuentaPorCobrar)
  @JoinColumn({ name: 'cuenta_por_cobrar_id' })
  cuentaPorCobrar: CuentaPorCobrar;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  monto_pagado: string;

  @Column({ type: 'varchar', length: 30 })
  medio_pago: MedioPago;

  @Column({ unique: true, length: 30 })
  numero_recibo: string;

  @CreateDateColumn()
  fecha_pago: Date;
}
