export function Calificaciones() {
  return (
    <div>
      <h1>Calificaciones</h1>
      <p>
        Pendiente de implementación: carga de notas de instrumentos de
        evaluación (endpoint disponible:{' '}
        <code>POST /api/v1/instrumentos/:instrumentoId/calificaciones</code>) y
        cierre de actas (<code>POST /api/v1/actas/:actaId/cerrar</code>).
      </p>
    </div>
  );
}
