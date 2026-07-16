import { useEffect, useState } from 'react';
import { EstadoCuenta as EstadoCuentaDto, obtenerEstadoCuenta } from '../../api/client';

const ESTUDIANTE_ID = 1;

export function EstadoCuenta() {
  const [estadoCuenta, setEstadoCuenta] = useState<EstadoCuentaDto | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerEstadoCuenta(ESTUDIANTE_ID)
      .then(setEstadoCuenta)
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <p>Cargando...</p>;
  if (!estadoCuenta) return <p>No se pudo obtener el estado de cuenta.</p>;

  return (
    <div>
      <h1>Estado de cuenta</h1>
      <p>
        Estado general:{' '}
        <strong style={{ color: estadoCuenta.estado === 'AL_DIA' ? 'green' : 'crimson' }}>
          {estadoCuenta.estado === 'AL_DIA' ? 'Al día' : 'Con mora'}
        </strong>
      </p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Concepto</th>
            <th>Monto</th>
            <th>Vencimiento</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {estadoCuenta.cuentas.map((c) => (
            <tr key={c.id}>
              <td>{c.concepto.nombre}</td>
              <td>{c.monto}</td>
              <td>{c.fecha_vencimiento}</td>
              <td>{c.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
