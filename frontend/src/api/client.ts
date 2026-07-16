import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api/v1',
});

export interface Seccion {
  id: number;
  codigo_seccion: string;
  cupo_maximo: number;
  cupo_ocupado: number;
  estado: string;
  materia: { id: number; nombre: string; codigo: string };
  docente: { nombre: string; apellido: string };
  turno: { nombre: string };
}

export interface Estudiante {
  id: number;
  matricula: string;
  nombre: string;
  apellido: string;
  estado: string;
  bloqueo_administrativo: boolean;
}

export interface EstadoCuenta {
  estado: 'AL_DIA' | 'CON_MORA';
  cuentas: Array<{
    id: number;
    monto: string;
    fecha_vencimiento: string;
    estado: string;
    concepto: { nombre: string };
  }>;
}

export async function obtenerSeccionesDisponibles(periodoId?: number): Promise<Seccion[]> {
  const { data } = await apiClient.get<Seccion[]>('/secciones', {
    params: periodoId ? { periodoId } : {},
  });
  return data;
}

export async function inscribirseASeccion(estudianteId: number, seccionId: number) {
  const { data } = await apiClient.post('/inscripciones', { estudianteId, seccionId });
  return data;
}

export async function obtenerEstudiante(estudianteId: number): Promise<Estudiante> {
  const { data } = await apiClient.get<Estudiante>(`/estudiantes/${estudianteId}`);
  return data;
}

export async function obtenerMisInscripciones(estudianteId: number) {
  const { data } = await apiClient.get(`/estudiantes/${estudianteId}/inscripciones`);
  return data;
}

export async function obtenerEstadoCuenta(estudianteId: number): Promise<EstadoCuenta> {
  const { data } = await apiClient.get<EstadoCuenta>(`/estudiantes/${estudianteId}/estado-cuenta`);
  return data;
}
