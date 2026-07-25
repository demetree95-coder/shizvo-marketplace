const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function api(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  return res;
}
