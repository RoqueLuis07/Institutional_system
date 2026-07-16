import { NavLink, Outlet } from 'react-router-dom';

const navPorRol: Record<string, { to: string; label: string }[]> = {
  estudiante: [
    { to: '/estudiante/secciones-disponibles', label: 'Secciones disponibles' },
    { to: '/estudiante/mis-inscripciones', label: 'Mis inscripciones' },
    { to: '/estudiante/estado-cuenta', label: 'Estado de cuenta' },
  ],
  docente: [
    { to: '/docente/asistencia', label: 'Asistencia' },
    { to: '/docente/calificaciones', label: 'Calificaciones' },
  ],
  admin: [
    { to: '/admin/carreras', label: 'Carreras' },
    { to: '/admin/secciones', label: 'Secciones' },
  ],
};

export function AppLayout({ rol }: { rol: 'estudiante' | 'docente' | 'admin' }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <nav style={{ width: 220, borderRight: '1px solid #ddd', padding: '1rem' }}>
        <h2 style={{ fontSize: '1rem', textTransform: 'uppercase', color: '#666' }}>{rol}</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {navPorRol[rol].map((item) => (
            <li key={item.to} style={{ margin: '0.5rem 0' }}>
              <NavLink to={item.to}>{item.label}</NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main style={{ flex: 1, padding: '2rem' }}>
        <Outlet />
      </main>
    </div>
  );
}
