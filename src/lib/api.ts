export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export function apiUrl(path: string) {
  if (!API_BASE) return path;
  return `${API_BASE}${path}`;
}

export async function getJson<T = unknown>(path: string): Promise<T> {
  const res = await fetch(apiUrl(path));
  return (await res.json()) as T;
}

export async function postJson<T = unknown>(
  path: string,
  body: unknown,
): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()) as T;
}
