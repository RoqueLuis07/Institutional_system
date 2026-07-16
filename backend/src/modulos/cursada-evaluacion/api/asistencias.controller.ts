import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clase } from '../entities/clase.entity';
import { Asistencia } from '../entities/asistencia.entity';

class AsistenciaDto {
  estudianteId: number;
  presente: boolean;
}

class RegistrarAsistenciasDto {
  fecha: string;
  asistencias: AsistenciaDto[];
}

@Controller('secciones/:seccionId/asistencias')
export class AsistenciasController {
  constructor(
    @InjectRepository(Clase) private readonly claseRepository: Repository<Clase>,
    @InjectRepository(Asistencia) private readonly asistenciaRepository: Repository<Asistencia>,
  ) {}

  @Post()
  async registrar(
    @Param('seccionId', ParseIntPipe) seccionId: number,
    @Body() dto: RegistrarAsistenciasDto,
  ) {
    let clase = await this.claseRepository.findOne({
      where: { seccion: { id: seccionId }, fecha: dto.fecha },
    });
    if (!clase) {
      clase = await this.claseRepository.save(
        this.claseRepository.create({ seccion: { id: seccionId }, fecha: dto.fecha }),
      );
    }

    const registros = dto.asistencias.map((a) =>
      this.asistenciaRepository.create({
        clase,
        estudiante: { id: a.estudianteId },
        presente: a.presente,
      }),
    );

    return this.asistenciaRepository.upsert(registros, ['clase', 'estudiante']);
  }
}
