import { useEffect, useState } from 'react';
import { obtenerMisInscripciones } from '../../api/client';

const ESTUDIANTE_ID = 1;

interface InscripcionSeccion {
  id: number;
  estado: string;
  seccion: { codigo_seccion: string; materia: { nombre: string } };
}

export function MisInscripciones() {
  const [inscripciones, setInscripciones] = useState<InscripcionSeccion[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerMisInscripciones(ESTUDIANTE_ID)
      .then(setInscripciones)
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <p>Cargando...</p>;

  return (
    <div>
      <h1>Mis inscripciones</h1>
      {inscripciones.length === 0 ? (
        <p>Todavía no tenés inscripciones registradas.</p>
      ) : (
        <ul>
          {inscripciones.map((i) => (
            <li key={i.id}>
              {i.seccion.materia.nombre} — Sección {i.seccion.codigo_seccion} ({i.estado})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
