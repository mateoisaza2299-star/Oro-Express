/** Esqueletos de carga: ocupan el mismo espacio que el contenido real para que nada salte. */

export function CatalogoEsqueleto() {
  return (
    <div aria-busy="true" role="status">
      <span className="sr-only">Cargando piezas…</span>
      <ul className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i} className="flex flex-col">
            <span className="skeleton block aspect-[4/5]" />
            <span className="mt-4 block border-t border-gold-line/70 pt-3">
              <span className="skeleton block h-3 w-1/4" />
              <span className="skeleton mt-3 block h-7 w-2/3" />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ColeccionesEsqueleto() {
  return (
    <div aria-busy="true" role="status" className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:auto-rows-[320px]">
      <span className="sr-only">Cargando colecciones…</span>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`skeleton block aspect-[4/5] border border-gold-line/60 lg:aspect-auto lg:h-full ${
            i === 0 ? "lg:col-span-7" : i === 1 ? "lg:col-span-5" : "lg:col-span-12"
          }`}
        />
      ))}
    </div>
  );
}

/** Mientras se descarga el código de la vista rápida: respuesta inmediata al toque. */
export function VistaEsqueleto() {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6" role="status" aria-busy="true">
      <span className="sr-only">Cargando pieza…</span>
      <div className="absolute inset-0 bg-ink/50" aria-hidden="true" />
      <div
        className="modal-in relative grid max-h-[92svh] w-full max-w-5xl overflow-hidden bg-ivory md:grid-cols-2"
        aria-hidden="true"
      >
        <span className="skeleton block aspect-[4/5] md:aspect-auto md:min-h-[32rem]" />
        <div className="space-y-4 px-5 py-8 md:px-8">
          <span className="skeleton block h-3 w-1/4" />
          <span className="skeleton block h-9 w-3/4" />
          <span className="skeleton block h-4 w-full" />
          <span className="skeleton block h-4 w-5/6" />
          <span className="skeleton mt-8 block h-12 w-48" />
        </div>
      </div>
    </div>
  );
}

export function PanelEsqueleto() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-5 pt-24" role="status" aria-busy="true">
      <span className="sr-only">Cargando panel…</span>
      <span className="skeleton block h-10 w-1/3" aria-hidden="true" />
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="skeleton block h-16 w-full" aria-hidden="true" />
      ))}
    </div>
  );
}
