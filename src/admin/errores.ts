export function textoError(error: unknown): string {
  if (typeof error === "string") return error.trim() || "Error desconocido";
  if (!error || typeof error !== "object") return "Error desconocido";
  const fila = error as { code?: string; message?: string };
  const codigo = fila.code?.trim();
  const mensaje = fila.message?.trim() || "Error desconocido";
  return codigo ? `${codigo} · ${mensaje}` : mensaje;
}

export function esSesionVencida(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const fila = error as { code?: string; message?: string };
  const code = String(fila.code ?? "").toUpperCase();
  const message = String(fila.message ?? "").toLowerCase();
  return (
    code === "PGRST301" ||
    code === "PGRST303" ||
    code === "SESION" ||
    message.includes("jwt expired") ||
    message.includes("invalid jwt") ||
    message.includes("session expired")
  );
}
