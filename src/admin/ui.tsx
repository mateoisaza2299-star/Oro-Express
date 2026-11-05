import { useEffect, useState } from "react";
import type { ReactNode } from "react";

export function Aviso({ texto, error }: { texto: string; error: boolean }) {
  return (
    <p
      role={error ? "alert" : "status"}
      aria-live={error ? "assertive" : "polite"}
      className={`mt-4 border px-4 py-3 text-sm ${error ? "border-ink text-ink" : "border-gold-line text-gold"}`}
    >
      {texto}
    </p>
  );
}

export function Toast({ texto, detalle, error }: { texto: string; detalle?: string; error: boolean }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[80] flex justify-center px-5">
      <div
        role={error ? "alert" : "status"}
        aria-live={error ? "assertive" : "polite"}
        className="pointer-events-auto w-full max-w-md border border-gold-line bg-ivory px-4 py-3 text-ink"
      >
        <p className="text-sm">{texto}</p>
        {detalle ? <p className="mt-1 text-xs break-words text-muted">{detalle}</p> : null}
      </div>
    </div>
  );
}

export function ErrorCarga({
  texto,
  detalle,
  onReintentar,
}: {
  texto: string;
  detalle: string;
  onReintentar: () => void;
}) {
  return (
    <div className="mt-6 min-w-0 border border-ink px-4 py-4">
      <p className="text-base text-ink">{texto}</p>
      {detalle ? <p className="mt-2 text-xs break-words text-muted">{detalle}</p> : null}
      <button
        type="button"
        onClick={onReintentar}
        className="mt-4 inline-flex min-h-11 items-center bg-ink px-4 text-xs tracking-[0.14em] text-ivory uppercase"
      >
        Reintentar
      </button>
    </div>
  );
}

export function Esqueleto({ filas = 4 }: { filas?: number }) {
  return (
    <ul className="mt-6" aria-hidden="true">
      {Array.from({ length: filas }, (_, indice) => (
        <li key={indice} className="flex gap-3 border-b border-gold-line/50 py-3">
          <span className="aspect-[4/5] w-14 shrink-0 animate-pulse bg-paper" />
          <span className="flex min-w-0 flex-1 flex-col justify-center gap-2">
            <span className="h-4 w-2/3 animate-pulse bg-paper" />
            <span className="h-3 w-1/2 animate-pulse bg-paper" />
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Conteo({ valor, max }: { valor: number; max?: number }) {
  const pasa = max != null && valor > max;
  return (
    <p className={`mt-1 text-right text-xs ${pasa ? "text-ink" : "text-muted"}`}>
      {max != null ? `${valor}/${max}` : `${valor} caracteres`}
    </p>
  );
}

export function Campo({
  id,
  etiqueta,
  value,
  onChange,
  type = "text",
  maxLength,
  inputMode,
  autoComplete = "off",
  placeholder,
  ayuda,
  error,
  conteo = false,
}: {
  id: string;
  etiqueta: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  maxLength?: number;
  inputMode?: "text" | "numeric" | "email" | "tel";
  autoComplete?: string;
  placeholder?: string;
  ayuda?: string;
  error?: string | null;
  conteo?: boolean;
}) {
  return (
    <div className="mt-5 min-w-0">
      <label htmlFor={id} className="text-xs tracking-[0.16em] text-gold uppercase">
        {etiqueta}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        maxLength={maxLength}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={ayuda || error ? `${id}-ayuda` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full min-w-0 border-b border-gold-line bg-transparent py-3 text-base text-ink outline-none placeholder:text-[#9c968c]"
      />
      {conteo ? <Conteo valor={value.length} max={maxLength} /> : null}
      {ayuda || error ? (
        <div id={`${id}-ayuda`}>
          {ayuda ? <p className="mt-1 text-xs leading-relaxed text-muted">{ayuda}</p> : null}
          {error ? <p className="mt-1 text-xs text-ink">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

export function Area({
  id,
  etiqueta,
  value,
  onChange,
  maxLength,
  rows = 3,
  ayuda,
  conteo = false,
}: {
  id: string;
  etiqueta: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  rows?: number;
  ayuda?: string;
  conteo?: boolean;
}) {
  return (
    <div className="mt-5 min-w-0">
      <label htmlFor={id} className="text-xs tracking-[0.16em] text-gold uppercase">
        {etiqueta}
      </label>
      <textarea
        id={id}
        name={id}
        rows={rows}
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full min-w-0 resize-y border-b border-gold-line bg-transparent py-3 text-base text-ink outline-none placeholder:text-[#9c968c]"
      />
      {conteo ? <Conteo valor={value.length} max={maxLength} /> : null}
      {ayuda ? <p className="mt-1 text-xs leading-relaxed text-muted">{ayuda}</p> : null}
    </div>
  );
}

export function Boton({
  children,
  type = "button",
  onClick,
  disabled = false,
  secundario = false,
  className = "",
}: {
  children: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  secundario?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-busy={disabled && children.startsWith("Guardando") ? true : undefined}
      className={`inline-flex min-h-11 w-full items-center justify-center px-3 text-center text-xs leading-tight tracking-[0.12em] uppercase disabled:opacity-50 sm:w-auto ${
        secundario ? "border border-gold-line bg-transparent text-ink" : "bg-ink text-ivory"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function Barra({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gold-line bg-ivory px-5 py-3">
      <div className="mx-auto w-full max-w-3xl min-w-0">{children}</div>
    </div>
  );
}

export function Progreso({ valor }: { valor: number }) {
  const porcentaje = Math.max(0, Math.min(100, Math.round(valor * 100)));
  return (
    <div
      className="mb-3 h-1.5 w-full bg-paper"
      role="progressbar"
      aria-valuenow={porcentaje}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Subida de la foto"
    >
      <div className="h-full bg-ink" style={{ width: `${porcentaje}%` }} />
    </div>
  );
}

export function VistaFoto({
  archivo,
  url,
  className,
}: {
  archivo: File | null;
  url: string | null;
  className: string;
}) {
  const [local, setLocal] = useState<string | null>(null);

  useEffect(() => {
    if (!archivo) return;
    const next = URL.createObjectURL(archivo);
    // oxlint-disable-next-line react/set-state-in-effect -- la vista previa sigue al archivo elegido
    setLocal(next);
    return () => URL.revokeObjectURL(next);
  }, [archivo]);

  const src = archivo ? local : url;
  if (!src) return <span className={`block bg-paper ${className}`} />;
  return <img src={src} alt="" className={className} />;
}

export function FotoField({
  id,
  archivo,
  url,
  onArchivo,
  onQuitar,
  progreso,
  error,
  disabled = false,
}: {
  id: string;
  archivo: File | null;
  url: string | null;
  onArchivo: (archivo: File | null) => void;
  onQuitar?: () => void;
  progreso?: number | null;
  error?: string | null;
  disabled?: boolean;
}) {
  const hayFoto = Boolean(archivo || url);

  return (
    <div className="mt-5 min-w-0">
      <p className="text-xs tracking-[0.16em] text-gold uppercase">Foto</p>
      <VistaFoto archivo={archivo} url={url} className="mt-3 aspect-[4/5] w-36 max-w-full object-cover" />
      <label
        className={`mt-3 inline-flex min-h-11 items-center bg-ink px-4 text-xs tracking-[0.12em] text-ivory uppercase ${
          disabled ? "opacity-50" : "cursor-pointer"
        }`}
      >
        Elegir foto
        <input
          id={id}
          name={id}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled}
          onChange={(event) => {
            const elegido = event.target.files?.[0] ?? null;
            event.currentTarget.value = "";
            onArchivo(elegido);
          }}
          className="sr-only"
        />
      </label>
      <p className="mt-2 text-sm text-muted">Usa fotos verticales (4:5).</p>
      {error ? <p className="mt-1 text-xs text-ink">{error}</p> : null}
      {progreso != null ? (
        <div className="mt-3">
          <Progreso valor={progreso} />
        </div>
      ) : null}
      {hayFoto && onQuitar ? (
        <button
          type="button"
          onClick={onQuitar}
          className="mt-2 inline-flex min-h-11 items-center text-xs tracking-[0.14em] text-gold uppercase"
        >
          Quitar foto
        </button>
      ) : null}
    </div>
  );
}
