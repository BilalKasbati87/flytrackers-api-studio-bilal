import type { QueryParams, QueryValue } from "@/types/travel";

function appendParam(
  searchParams: URLSearchParams,
  key: string,
  value: QueryValue | QueryValue[] | null | undefined,
) {
  if (value === null || value === undefined || value === "") {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry) => appendParam(searchParams, key, entry));
    return;
  }

  searchParams.append(key, String(value));
}

export function toQueryString(params: QueryParams) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    appendParam(searchParams, key, value);
  }

  return searchParams.toString();
}

export async function fetchJson<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
  });

  const payload = await response.text();

  if (!response.ok) {
    throw new Error(
      `Request failed with ${response.status}: ${payload.slice(0, 400)}`,
    );
  }

  return payload ? (JSON.parse(payload) as T) : ({} as T);
}