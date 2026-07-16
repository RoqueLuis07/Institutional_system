import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { InfraestructuraAcademicaModule } from './modulos/infraestructura-academica/infraestructura-academica.module';
import { AdmisionInscripcionModule } from './modulos/admision-inscripcion/admision-inscripcion.module';
import { CursadaEvaluacionModule } from './modulos/cursada-evaluacion/cursada-evaluacion.module';
import { FinancieroModule } from './modulos/financiero/financiero.module';
import { EgresamientoModule } from './modulos/egresamiento/egresamiento.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot(typeOrmConfig),
    InfraestructuraAcademicaModule,
    AdmisionInscripcionModule,
    CursadaEvaluacionModule,
    FinancieroModule,
    EgresamientoModule,
  ],
})
export class AppModule {}
