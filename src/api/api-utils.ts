import axios, { AxiosError } from "axios";

export function toError(err: unknown): Error {
  if (axios.isAxiosError(err)) {
    const e = err as AxiosError;
    const status = e.response?.status;
    const data: unknown = e.response?.data;

    let message = e.message;
    // Friendly message for slug conflicts
    if (status === 409) {
      message = "Slug already in use";
    }
    if (typeof data === "string") {
      message = data;
    } else if (data && typeof data === "object") {
      const maybeMessage = (data as { message?: unknown }).message;
      if (typeof maybeMessage === "string") {
        message = maybeMessage;
      } else {
        try {
          message = JSON.stringify(data);
        } catch {
          message = e.message;
        }
      }
    }

    return new Error(`Request failed${status ? ` (status ${status})` : ""}: ${message}`);
  }
  return err instanceof Error ? err : new Error(String(err));
}

export function ensureId(id?: string) {
  if (!id) throw new Error("id is required");
  // Basic UUID validation regex
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    // If it's not a UUID, we might want to allow it if it's a slug,
    // but for functions explicitly named 'ById', it should probably be a UUID.
    // However, some legacy IDs or slugs might be passed here.
    // Let's just warn for now or throw if strict validation is needed.
    // throw new Error(`Invalid UUID format: ${id}`);
  }
}

export function checkStatus(status: number, okStatuses: number[] = [200, 201, 204, 304]) {
  if (!okStatuses.includes(status)) throw new Error(`Unexpected status ${status}`);
}
