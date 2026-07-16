import { Controller, Get, NotFoundException, Param, ParseIntPipe } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estudiante } from '../entities/estudiante.entity';
import { InscripcionSeccion } from '../entities/inscripcion-seccion.entity';

@Controller('estudiantes')
export class EstudiantesController {
  constructor(
    @InjectRepository(Estudiante)
    private readonly estudianteRepository: Repository<Estudiante>,
    @InjectRepository(InscripcionSeccion)
    private readonly inscripcionSeccionRepository: Repository<InscripcionSeccion>,
  ) {}

  @Get(':id')
  async obtener(@Param('id', ParseIntPipe) id: number) {
    const estudiante = await this.estudianteRepository.findOne({
      where: { id },
      relations: ['carrera', 'planEstudio'],
    });
    if (!estudiante) {
      throw new NotFoundException('Estudiante inexistente');
    }
    return estudiante;
  }

  @Get(':id/inscripciones')
  async listarInscripciones(@Param('id', ParseIntPipe) id: number) {
    return this.inscripcionSeccionRepository
      .createQueryBuilder('inscripcionSeccion')
      .innerJoin('inscripcionSeccion.inscripcionPeriodo', 'inscripcionPeriodo')
      .innerJoinAndSelect('inscripcionSeccion.seccion', 'seccion')
      .innerJoinAndSelect('seccion.materia', 'materia')
      .where('inscripcionPeriodo.estudianteId = :id', { id })
      .getMany();
  }
}
