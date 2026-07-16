import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from './entities';
import { GenerarDeudaListener } from './listeners/generar-deuda.listener';
import { EstadoCuentaController } from './api/estado-cuenta.controller';

@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  controllers: [EstadoCuentaController],
  providers: [GenerarDeudaListener],
})
export class FinancieroModule {}
