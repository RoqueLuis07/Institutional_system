import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from './entities';
import { SeccionesController } from './api/secciones.controller';

@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  controllers: [SeccionesController],
  exports: [TypeOrmModule],
})
export class InfraestructuraAcademicaModule {}
