import prisma from "./prisma";

export function normalizeUsername(base: string): string {
  const cleaned = base
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "")
    .replace(/^[_.-]+|[_.-]+$/g, "");
  if (cleaned.length >= 3) return cleaned;
  return `user${Math.random().toString(36).slice(2, 8)}`;
}

export async function generateUniqueUsername(
  rawSuggestion: string,
): Promise<{ username: string; displayUsername: string }> {
  const displayUsername = rawSuggestion;
  const base = normalizeUsername(rawSuggestion || "user");

  // Try base, then base+number, then base+random tail
  const maxSequentialAttempts = 25;
  for (let i = 0; i < maxSequentialAttempts; i++) {
    const candidate = i === 0 ? base : `${base}${i}`;
    const exists = await prisma.user.findUnique({
      where: { username: candidate },
    });
    if (!exists) return { username: candidate, displayUsername };
  }

  // Randomized attempts to minimize race collisions
  for (let i = 0; i < 25; i++) {
    const candidate = `${base}${Math.random().toString(36).slice(2, 6)}`;
    const exists = await prisma.user.findUnique({
      where: { username: candidate },
    });
    if (!exists) return { username: candidate, displayUsername };
  }

  // Final fallback
  const fallback = `${base}${Date.now().toString(36)}`;
  return { username: fallback, displayUsername };
}

export function buildSuggestionFromProfile(
  profile: unknown,
  fields: string[],
): string {
  const obj = (profile ?? {}) as Record<string, unknown>;
  for (const key of fields) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  // If email is present, take local part
  const email = obj["email"];
  if (typeof email === "string" && email.includes("@")) {
    const local = email.split("@")[0];
    if (local.trim()) return local;
  }
  return "user";
}
