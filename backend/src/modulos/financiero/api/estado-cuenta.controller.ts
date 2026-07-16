import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CuentaPorCobrar, EstadoCuentaPorCobrar } from '../entities/cuenta-por-cobrar.entity';

@Controller('estudiantes')
export class EstadoCuentaController {
  constructor(
    @InjectRepository(CuentaPorCobrar)
    private readonly cuentaPorCobrarRepository: Repository<CuentaPorCobrar>,
  ) {}

  @Get(':id/estado-cuenta')
  async obtenerEstadoCuenta(@Param('id', ParseIntPipe) id: number) {
    const cuentas = await this.cuentaPorCobrarRepository.find({
      where: { estudiante: { id } },
      relations: ['concepto'],
      order: { fecha_vencimiento: 'ASC' },
    });

    const conMora = cuentas.some((c) => c.estado === EstadoCuentaPorCobrar.VENCIDA);

    return {
      estado: conMora ? 'CON_MORA' : 'AL_DIA',
      cuentas,
    };
  }
}
