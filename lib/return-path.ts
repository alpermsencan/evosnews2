export function safeReturnPath(value: string | null | undefined, fallback = "/hesabim") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes(String.fromCharCode(92)) || [...value].some(c => c.charCodeAt(0) <= 32)) return fallback;
  return value;
}
