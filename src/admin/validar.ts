export function whatsappValido(valor: string): boolean {
  const digitos = valor.trim();
  if (!digitos) return true;
  return /^\d{10,15}$/.test(digitos);
}

export function correoValido(valor: string): boolean {
  const texto = valor.trim();
  if (!texto) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto);
}

/** @usuario o un enlace (con o sin https). */
export function redValida(valor: string): boolean {
  const texto = valor.trim();
  if (!texto) return true;
  if (/^@[A-Za-z0-9._]{1,30}$/.test(texto)) return true;
  if (/^https?:\/\/\S+$/i.test(texto)) return true;
  return /^(www\.)?[A-Za-z0-9.-]+\.[A-Za-z]{2,}(\/\S*)?$/.test(texto);
}
