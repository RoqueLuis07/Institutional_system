-- =====================================================================
-- Sistema de Gestión Universitaria (SGA/SIS)
-- Esquema relacional PostgreSQL
-- Módulo A: Infraestructura Académica
-- Módulo B: Admisión e Inscripción
-- Módulo C: Cursada y Evaluación
-- Módulo D: Financiero (Caja y Cuentas por Cobrar)
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- MÓDULO A: INFRAESTRUCTURA ACADÉMICA
-- =====================================================================

CREATE TABLE facultades (
    id              SERIAL PRIMARY KEY,
    codigo          VARCHAR(10) NOT NULL UNIQUE,
    nombre          VARCHAR(150) NOT NULL,
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sedes (
    id              SERIAL PRIMARY KEY,
    codigo          VARCHAR(10) NOT NULL UNIQUE,
    nombre          VARCHAR(150) NOT NULL,
    direccion       VARCHAR(255),
    activo          BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE turnos (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(30) NOT NULL UNIQUE, -- 'Mañana', 'Tarde', 'Noche'
    hora_inicio     TIME NOT NULL,
    hora_fin        TIME NOT NULL,
    CONSTRAINT chk_turno_horas CHECK (hora_fin > hora_inicio)
);

CREATE TABLE carreras (
    id                  SERIAL PRIMARY KEY,
    facultad_id         INTEGER NOT NULL REFERENCES facultades(id) ON DELETE RESTRICT,
    codigo              VARCHAR(15) NOT NULL UNIQUE,
    nombre              VARCHAR(150) NOT NULL,
    duracion_semestres  SMALLINT NOT NULL CHECK (duracion_semestres > 0),
    titulo_otorgado     VARCHAR(150),
    activo              BOOLEAN NOT NULL DEFAULT TRUE
);

-- Versionado de mallas curriculares. Una carrera puede tener varios planes
-- de estudio vigentes en distintos momentos (reforma curricular).
CREATE TABLE planes_estudio (
    id                  SERIAL PRIMARY KEY,
    carrera_id          INTEGER NOT NULL REFERENCES carreras(id) ON DELETE RESTRICT,
    version             VARCHAR(20) NOT NULL,
    vigente_desde       DATE NOT NULL,
    vigente_hasta       DATE,
    activo              BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (carrera_id, version),
    CONSTRAINT chk_plan_vigencia CHECK (vigente_hasta IS NULL OR vigente_hasta > vigente_desde)
);

CREATE TABLE materias (
    id                  SERIAL PRIMARY KEY,
    codigo              VARCHAR(20) NOT NULL UNIQUE,
    nombre              VARCHAR(150) NOT NULL,
    creditos            SMALLINT NOT NULL CHECK (creditos > 0),
    horas_semanales     SMALLINT NOT NULL CHECK (horas_semanales > 0),
    activo              BOOLEAN NOT NULL DEFAULT TRUE
);

-- Ubicación de una materia dentro de un plan de estudio específico.
CREATE TABLE plan_estudio_materias (
    id                  SERIAL PRIMARY KEY,
    plan_estudio_id     INTEGER NOT NULL REFERENCES planes_estudio(id) ON DELETE CASCADE,
    materia_id          INTEGER NOT NULL REFERENCES materias(id) ON DELETE RESTRICT,
    semestre            SMALLINT NOT NULL CHECK (semestre > 0),
    obligatoria         BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (plan_estudio_id, materia_id)
);

-- Correlatividades (prerrequisitos). Se definen sobre el plan de estudio,
-- referenciando la materia y su requisito dentro del mismo plan.
CREATE TABLE correlatividades (
    id                      SERIAL PRIMARY KEY,
    plan_estudio_id         INTEGER NOT NULL REFERENCES planes_estudio(id) ON DELETE CASCADE,
    materia_id              INTEGER NOT NULL REFERENCES materias(id) ON DELETE CASCADE,
    materia_requisito_id    INTEGER NOT NULL REFERENCES materias(id) ON DELETE CASCADE,
    tipo_requisito          VARCHAR(20) NOT NULL DEFAULT 'APROBADA'
                                CHECK (tipo_requisito IN ('APROBADA', 'REGULARIZADA')),
    UNIQUE (plan_estudio_id, materia_id, materia_requisito_id),
    CONSTRAINT chk_correlatividad_no_autorreferencia CHECK (materia_id <> materia_requisito_id)
);

CREATE TABLE docentes (
    id              SERIAL PRIMARY KEY,
    documento       VARCHAR(20) NOT NULL UNIQUE,
    nombre          VARCHAR(100) NOT NULL,
    apellido        VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    activo          BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE aulas (
    id              SERIAL PRIMARY KEY,
    sede_id         INTEGER REFERENCES sedes(id) ON DELETE RESTRICT, -- NULL si es virtual
    nombre          VARCHAR(50) NOT NULL,
    tipo            VARCHAR(10) NOT NULL CHECK (tipo IN ('FISICA', 'VIRTUAL')),
    capacidad       SMALLINT NOT NULL CHECK (capacidad > 0),
    CONSTRAINT chk_aula_sede CHECK (
        (tipo = 'FISICA' AND sede_id IS NOT NULL) OR
        (tipo = 'VIRTUAL' AND sede_id IS NULL)
    )
);

CREATE TABLE periodos_academicos (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(50) NOT NULL UNIQUE, -- '2026-1S'
    fecha_inicio    DATE NOT NULL,
    fecha_fin       DATE NOT NULL,
    estado          VARCHAR(20) NOT NULL DEFAULT 'PLANIFICACION'
                        CHECK (estado IN ('PLANIFICACION', 'INSCRIPCION_ABIERTA', 'EN_CURSO', 'CERRADO')),
    CONSTRAINT chk_periodo_fechas CHECK (fecha_fin > fecha_inicio)
);

-- Instanciación física/virtual de una materia para un período académico.
CREATE TABLE secciones (
    id                  SERIAL PRIMARY KEY,
    materia_id          INTEGER NOT NULL REFERENCES materias(id) ON DELETE RESTRICT,
    periodo_academico_id INTEGER NOT NULL REFERENCES periodos_academicos(id) ON DELETE RESTRICT,
    docente_id          INTEGER NOT NULL REFERENCES docentes(id) ON DELETE RESTRICT,
    aula_id             INTEGER REFERENCES aulas(id) ON DELETE RESTRICT,
    turno_id            INTEGER NOT NULL REFERENCES turnos(id) ON DELETE RESTRICT,
    codigo_seccion      VARCHAR(10) NOT NULL, -- 'A', 'B', 'N1'
    cupo_maximo         SMALLINT NOT NULL CHECK (cupo_maximo > 0),
    cupo_ocupado        SMALLINT NOT NULL DEFAULT 0 CHECK (cupo_ocupado >= 0),
    estado              VARCHAR(20) NOT NULL DEFAULT 'ABIERTA'
                            CHECK (estado IN ('ABIERTA', 'CERRADA', 'CANCELADA')),
    UNIQUE (materia_id, periodo_academico_id, codigo_seccion),
    CONSTRAINT chk_seccion_cupo CHECK (cupo_ocupado <= cupo_maximo)
);

CREATE TABLE horarios_seccion (
    id              SERIAL PRIMARY KEY,
    seccion_id      INTEGER NOT NULL REFERENCES secciones(id) ON DELETE CASCADE,
    dia_semana      SMALLINT NOT NULL CHECK (dia_semana BETWEEN 1 AND 7), -- 1=Lunes ... 7=Domingo
    hora_inicio     TIME NOT NULL,
    hora_fin        TIME NOT NULL,
    CONSTRAINT chk_horario_seccion CHECK (hora_fin > hora_inicio)
);

-- Evita cargar dos bloques horarios idénticos para la misma sección.
CREATE UNIQUE INDEX uq_horario_seccion ON horarios_seccion (seccion_id, dia_semana, hora_inicio, hora_fin);

-- =====================================================================
-- MÓDULO B: ADMISIÓN E INSCRIPCIÓN
-- =====================================================================

CREATE TABLE postulantes (
    id                  SERIAL PRIMARY KEY,
    documento           VARCHAR(20) NOT NULL UNIQUE,
    nombre              VARCHAR(100) NOT NULL,
    apellido            VARCHAR(100) NOT NULL,
    email               VARCHAR(150) NOT NULL UNIQUE,
    telefono            VARCHAR(30),
    fecha_nacimiento    DATE NOT NULL,
    carrera_id          INTEGER NOT NULL REFERENCES carreras(id) ON DELETE RESTRICT,
    estado              VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
                            CHECK (estado IN ('PENDIENTE', 'EN_REVISION', 'APROBADO', 'RECHAZADO')),
    creado_en           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE documentos_postulante (
    id                  SERIAL PRIMARY KEY,
    postulante_id       INTEGER NOT NULL REFERENCES postulantes(id) ON DELETE CASCADE,
    tipo_documento      VARCHAR(30) NOT NULL CHECK (tipo_documento IN ('DNI', 'TITULO_SECUNDARIO', 'PARTIDA_NACIMIENTO', 'FOTO', 'OTRO')),
    url_archivo         VARCHAR(500) NOT NULL,
    verificado          BOOLEAN NOT NULL DEFAULT FALSE,
    cargado_en          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Un estudiante nace de un postulante aprobado (o puede darse de alta directa
-- para casos de convenio/transferencia -> postulante_id nullable).
CREATE TABLE estudiantes (
    id                  SERIAL PRIMARY KEY,
    postulante_id       INTEGER UNIQUE REFERENCES postulantes(id) ON DELETE SET NULL,
    matricula           VARCHAR(20) NOT NULL UNIQUE, -- ID único generado en la aprobación
    documento           VARCHAR(20) NOT NULL UNIQUE,
    nombre              VARCHAR(100) NOT NULL,
    apellido            VARCHAR(100) NOT NULL,
    email               VARCHAR(150) NOT NULL UNIQUE,
    carrera_id          INTEGER NOT NULL REFERENCES carreras(id) ON DELETE RESTRICT,
    plan_estudio_id     INTEGER NOT NULL REFERENCES planes_estudio(id) ON DELETE RESTRICT,
    fecha_ingreso        DATE NOT NULL DEFAULT CURRENT_DATE,
    estado              VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
                            CHECK (estado IN ('ACTIVO', 'INACTIVO', 'EGRESADO', 'BAJA')),
    bloqueo_administrativo BOOLEAN NOT NULL DEFAULT FALSE -- true = deuda/mora, bloquea inscripción
);

-- Cabecera de inscripción de un estudiante a un período académico.
CREATE TABLE inscripciones_periodo (
    id                      SERIAL PRIMARY KEY,
    estudiante_id           INTEGER NOT NULL REFERENCES estudiantes(id) ON DELETE RESTRICT,
    periodo_academico_id    INTEGER NOT NULL REFERENCES periodos_academicos(id) ON DELETE RESTRICT,
    fecha_inscripcion       TIMESTAMPTZ NOT NULL DEFAULT now(),
    estado                  VARCHAR(20) NOT NULL DEFAULT 'ACTIVA'
                                CHECK (estado IN ('ACTIVA', 'ANULADA')),
    UNIQUE (estudiante_id, periodo_academico_id)
);

-- Detalle: cada sección elegida dentro de la inscripción al período.
CREATE TABLE inscripciones_seccion (
    id                      SERIAL PRIMARY KEY,
    inscripcion_periodo_id  INTEGER NOT NULL REFERENCES inscripciones_periodo(id) ON DELETE CASCADE,
    seccion_id              INTEGER NOT NULL REFERENCES secciones(id) ON DELETE RESTRICT,
    estado                  VARCHAR(20) NOT NULL DEFAULT 'INSCRIPTA'
                                CHECK (estado IN ('INSCRIPTA', 'BAJA')),
    fecha                   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (inscripcion_periodo_id, seccion_id)
);

-- Histórico consolidado de notas, alimentado por el módulo de Evaluación (Fase 2).
-- Se incluye aquí porque el proceso de inscripción necesita consultarlo
-- para validar correlatividades.
CREATE TABLE historial_academico (
    id                      SERIAL PRIMARY KEY,
    estudiante_id           INTEGER NOT NULL REFERENCES estudiantes(id) ON DELETE RESTRICT,
    materia_id              INTEGER NOT NULL REFERENCES materias(id) ON DELETE RESTRICT,
    periodo_academico_id    INTEGER NOT NULL REFERENCES periodos_academicos(id) ON DELETE RESTRICT,
    nota_final              NUMERIC(4,2) CHECK (nota_final BETWEEN 0 AND 10),
    condicion               VARCHAR(20) NOT NULL
                                CHECK (condicion IN ('APROBADA', 'DESAPROBADA', 'REGULAR', 'LIBRE')),
    fecha                   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (estudiante_id, materia_id, periodo_academico_id)
);

-- =====================================================================
-- MÓDULO C: CURSADA Y EVALUACIÓN
-- =====================================================================

-- Asistencia diaria tomada por el docente sobre una sección.
CREATE TABLE clases (
    id                  SERIAL PRIMARY KEY,
    seccion_id          INTEGER NOT NULL REFERENCES secciones(id) ON DELETE CASCADE,
    fecha               DATE NOT NULL,
    tema                VARCHAR(255),
    UNIQUE (seccion_id, fecha)
);

CREATE TABLE asistencias (
    id                  SERIAL PRIMARY KEY,
    clase_id            INTEGER NOT NULL REFERENCES clases(id) ON DELETE CASCADE,
    estudiante_id       INTEGER NOT NULL REFERENCES estudiantes(id) ON DELETE RESTRICT,
    presente            BOOLEAN NOT NULL,
    UNIQUE (clase_id, estudiante_id)
);

-- Instrumentos de evaluación continua: trabajos prácticos, parciales, etc.
CREATE TABLE instrumentos_evaluacion (
    id                  SERIAL PRIMARY KEY,
    seccion_id          INTEGER NOT NULL REFERENCES secciones(id) ON DELETE CASCADE,
    nombre              VARCHAR(150) NOT NULL,
    tipo                VARCHAR(20) NOT NULL
                            CHECK (tipo IN ('TRABAJO_PRACTICO', 'PARCIAL', 'OTRO')),
    ponderacion         NUMERIC(5,2) NOT NULL CHECK (ponderacion > 0 AND ponderacion <= 100),
    fecha               DATE
);

CREATE TABLE calificaciones_instrumento (
    id                      SERIAL PRIMARY KEY,
    instrumento_id          INTEGER NOT NULL REFERENCES instrumentos_evaluacion(id) ON DELETE CASCADE,
    estudiante_id           INTEGER NOT NULL REFERENCES estudiantes(id) ON DELETE RESTRICT,
    nota                    NUMERIC(4,2) NOT NULL CHECK (nota BETWEEN 0 AND 10),
    fecha_carga             TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (instrumento_id, estudiante_id)
);

-- Actas de examen final: una por sección/llamado. Consolida la nota final
-- del alumno y, al cerrarse, impacta en historial_academico.
CREATE TABLE actas_examen_final (
    id                  SERIAL PRIMARY KEY,
    seccion_id          INTEGER NOT NULL REFERENCES secciones(id) ON DELETE RESTRICT,
    fecha_examen        DATE NOT NULL,
    numero_llamado      SMALLINT NOT NULL CHECK (numero_llamado > 0),
    estado              VARCHAR(20) NOT NULL DEFAULT 'ABIERTA'
                            CHECK (estado IN ('ABIERTA', 'CERRADA')),
    cerrada_en          TIMESTAMPTZ,
    UNIQUE (seccion_id, numero_llamado)
);

CREATE TABLE actas_examen_final_detalle (
    id                      SERIAL PRIMARY KEY,
    acta_id                 INTEGER NOT NULL REFERENCES actas_examen_final(id) ON DELETE CASCADE,
    estudiante_id           INTEGER NOT NULL REFERENCES estudiantes(id) ON DELETE RESTRICT,
    nota_proceso            NUMERIC(4,2) CHECK (nota_proceso BETWEEN 0 AND 10),
    nota_examen             NUMERIC(4,2) CHECK (nota_examen BETWEEN 0 AND 10),
    nota_final              NUMERIC(4,2) CHECK (nota_final BETWEEN 0 AND 10),
    condicion               VARCHAR(20) NOT NULL
                                CHECK (condicion IN ('APROBADA', 'DESAPROBADA', 'AUSENTE')),
    UNIQUE (acta_id, estudiante_id)
);

-- =====================================================================
-- MÓDULO D: FINANCIERO (CAJA Y CUENTAS POR COBRAR)
-- =====================================================================

CREATE TABLE conceptos_arancel (
    id                  SERIAL PRIMARY KEY,
    codigo              VARCHAR(20) NOT NULL UNIQUE, -- 'MATRICULA', 'ARANCEL_CURSADA', 'CUOTA', 'EXAMEN_EXTRAORDINARIO', 'CERTIFICADO', 'MULTA_BIBLIOTECA'
    nombre              VARCHAR(150) NOT NULL,
    monto_base          NUMERIC(12,2) NOT NULL CHECK (monto_base >= 0)
);

-- Cabecera de deuda generada para un estudiante (por inscripción a período,
-- por arancel especial, por multa, etc.).
CREATE TABLE cuentas_por_cobrar (
    id                      SERIAL PRIMARY KEY,
    estudiante_id           INTEGER NOT NULL REFERENCES estudiantes(id) ON DELETE RESTRICT,
    concepto_id             INTEGER NOT NULL REFERENCES conceptos_arancel(id) ON DELETE RESTRICT,
    periodo_academico_id    INTEGER REFERENCES periodos_academicos(id) ON DELETE RESTRICT, -- NULL para aranceles no ligados a un período
    monto                   NUMERIC(12,2) NOT NULL CHECK (monto >= 0),
    fecha_vencimiento       DATE NOT NULL,
    estado                  VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
                                CHECK (estado IN ('PENDIENTE', 'PAGADA', 'VENCIDA', 'ANULADA')),
    generado_en             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pagos (
    id                      SERIAL PRIMARY KEY,
    cuenta_por_cobrar_id    INTEGER NOT NULL REFERENCES cuentas_por_cobrar(id) ON DELETE RESTRICT,
    monto_pagado            NUMERIC(12,2) NOT NULL CHECK (monto_pagado > 0),
    medio_pago              VARCHAR(30) NOT NULL CHECK (medio_pago IN ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'OTRO')),
    numero_recibo           VARCHAR(30) NOT NULL UNIQUE,
    fecha_pago              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- ÍNDICES DE APOYO A CONSULTAS FRECUENTES
-- =====================================================================

CREATE INDEX idx_secciones_periodo ON secciones (periodo_academico_id);
CREATE INDEX idx_inscripciones_seccion_seccion ON inscripciones_seccion (seccion_id);
CREATE INDEX idx_historial_estudiante ON historial_academico (estudiante_id);
CREATE INDEX idx_historial_estudiante_condicion ON historial_academico (estudiante_id, condicion);
CREATE INDEX idx_estudiantes_carrera ON estudiantes (carrera_id);
CREATE INDEX idx_asistencias_estudiante ON asistencias (estudiante_id);
CREATE INDEX idx_calificaciones_estudiante ON calificaciones_instrumento (estudiante_id);
CREATE INDEX idx_actas_detalle_estudiante ON actas_examen_final_detalle (estudiante_id);
CREATE INDEX idx_cuentas_por_cobrar_estudiante ON cuentas_por_cobrar (estudiante_id, estado);
CREATE INDEX idx_pagos_cuenta ON pagos (cuenta_por_cobrar_id);
