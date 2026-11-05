import { useEffect, useState } from "react";

export function Aviso({ texto, error }: { texto: string; error: boolean }) {
  return (
    <p
      role={error ? "alert" : "status"}
      className={`mt-4 border px-4 py-3 text-sm ${error ? "border-ink text-ink" : "border-gold-line text-gold"}`}
    >
      {texto}
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
}: {
  id: string;
  etiqueta: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  maxLength?: number;
  inputMode?: "text" | "numeric" | "email" | "tel";
  autoComplete?: string;
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
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full min-w-0 border-b border-gold-line bg-transparent py-3 text-base text-ink outline-none"
      />
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
}: {
  id: string;
  etiqueta: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  rows?: number;
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
        className="mt-2 w-full min-w-0 resize-y border-b border-gold-line bg-transparent py-3 text-base text-ink outline-none"
      />
    </div>
  );
}

export function Boton({
  children,
  type = "button",
  onClick,
  disabled = false,
  secundario = false,
}: {
  children: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  secundario?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-11 w-full items-center justify-center px-4 text-center text-xs tracking-[0.14em] uppercase disabled:opacity-50 sm:w-auto ${
        secundario ? "border border-gold-line bg-transparent text-ink" : "bg-ink text-ivory"
      }`}
    >
      {children}
    </button>
  );
}

export function FotoField({
  id,
  archivo,
  url,
  onArchivo,
}: {
  id: string;
  archivo: File | null;
  url: string | null;
  onArchivo: (archivo: File | null) => void;
}) {
  const [vista, setVista] = useState<string | null>(null);

  useEffect(() => {
    if (!archivo) return;
    const next = URL.createObjectURL(archivo);
    // oxlint-disable-next-line react/set-state-in-effect -- la vista previa sigue al archivo elegido
    setVista(next);
    return () => URL.revokeObjectURL(next);
  }, [archivo]);

  const src = archivo ? vista : url;

  return (
    <div className="mt-5 min-w-0">
      <label htmlFor={id} className="text-xs tracking-[0.16em] text-gold uppercase">
        Foto
      </label>
      {src ? <img src={src} alt="" className="mt-3 aspect-[4/5] w-28 object-cover" /> : null}
      <input
        id={id}
        name={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => onArchivo(event.target.files?.[0] ?? null)}
        className="mt-3 block w-full max-w-full text-sm text-ink file:mr-3 file:inline-flex file:min-h-11 file:items-center file:border-0 file:bg-ink file:px-3 file:text-xs file:tracking-[0.12em] file:text-ivory file:uppercase"
      />
      <p className="mt-2 text-sm text-muted">Usa fotos verticales (4:5).</p>
    </div>
  );
}
