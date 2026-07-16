import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { SeccionesDisponibles } from './pages/estudiante/SeccionesDisponibles';
import { MisInscripciones } from './pages/estudiante/MisInscripciones';
import { EstadoCuenta } from './pages/estudiante/EstadoCuenta';
import { Asistencia } from './pages/docente/Asistencia';
import { Calificaciones } from './pages/docente/Calificaciones';
import { Carreras } from './pages/admin/Carreras';
import { Secciones } from './pages/admin/Secciones';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/estudiante/secciones-disponibles" replace />} />

      <Route path="/estudiante" element={<AppLayout rol="estudiante" />}>
        <Route path="secciones-disponibles" element={<SeccionesDisponibles />} />
        <Route path="mis-inscripciones" element={<MisInscripciones />} />
        <Route path="estado-cuenta" element={<EstadoCuenta />} />
      </Route>

      <Route path="/docente" element={<AppLayout rol="docente" />}>
        <Route path="asistencia" element={<Asistencia />} />
        <Route path="calificaciones" element={<Calificaciones />} />
      </Route>

      <Route path="/admin" element={<AppLayout rol="admin" />}>
        <Route path="carreras" element={<Carreras />} />
        <Route path="secciones" element={<Secciones />} />
      </Route>
    </Routes>
  );
}
