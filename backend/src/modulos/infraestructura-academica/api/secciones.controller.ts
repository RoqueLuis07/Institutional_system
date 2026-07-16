import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seccion } from '../entities/seccion.entity';

@Controller('secciones')
export class SeccionesController {
  constructor(
    @InjectRepository(Seccion)
    private readonly seccionRepository: Repository<Seccion>,
  ) {}

  @Get()
  async listar(@Query('periodoId') periodoId?: string) {
    return this.seccionRepository.find({
      where: periodoId ? { periodoAcademico: { id: Number(periodoId) } } : {},
      relations: ['materia', 'docente', 'turno', 'periodoAcademico'],
      order: { id: 'ASC' },
    });
  }
}
