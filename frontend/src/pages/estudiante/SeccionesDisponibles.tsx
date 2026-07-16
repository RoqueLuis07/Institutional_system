import { useEffect, useState, type CSSProperties } from 'react';
import { inscribirseASeccion, obtenerSeccionesDisponibles, Seccion } from '../../api/client';

// En esta fase el ID del estudiante se toma de forma fija a falta de login;
// se reemplaza por el usuario autenticado cuando se agregue auth.
const ESTUDIANTE_ID = 1;

export function SeccionesDisponibles() {
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargarSecciones = async () => {
    setCargando(true);
    try {
      const data = await obtenerSeccionesDisponibles();
      setSecciones(data);
    } catch {
      setError('No se pudieron cargar las secciones. ¿Está el backend corriendo?');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarSecciones();
  }, []);

  const inscribirse = async (seccionId: number) => {
    setMensaje(null);
    setError(null);
    try {
      await inscribirseASeccion(ESTUDIANTE_ID, seccionId);
      setMensaje('Inscripción registrada correctamente.');
      cargarSecciones();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'No se pudo completar la inscripción.');
    }
  };

  if (cargando) return <p>Cargando secciones...</p>;

  return (
    <div>
      <h1>Secciones disponibles</h1>
      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={celda}>Materia</th>
            <th style={celda}>Sección</th>
            <th style={celda}>Docente</th>
            <th style={celda}>Turno</th>
            <th style={celda}>Cupo</th>
            <th style={celda}></th>
          </tr>
        </thead>
        <tbody>
          {secciones.map((s) => (
            <tr key={s.id}>
              <td style={celda}>{s.materia.nombre}</td>
              <td style={celda}>{s.codigo_seccion}</td>
              <td style={celda}>
                {s.docente.nombre} {s.docente.apellido}
              </td>
              <td style={celda}>{s.turno.nombre}</td>
              <td style={celda}>
                {s.cupo_ocupado}/{s.cupo_maximo}
              </td>
              <td style={celda}>
                <button disabled={s.cupo_ocupado >= s.cupo_maximo} onClick={() => inscribirse(s.id)}>
                  Inscribirme
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const celda: CSSProperties = {
  border: '1px solid #ddd',
  padding: '0.5rem',
  textAlign: 'left',
};
