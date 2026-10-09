export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Do not forward upstream response bodies: OAuth and provider errors can contain secrets.
export async function requestJson(url, options = {}, { fetch = globalThis.fetch, service = 'Upstream' } = {}) {
  let response;
  try {
    response = await fetch(url, { ...options, redirect: 'error', signal: AbortSignal.timeout(15_000) });
  } catch {
    throw new HttpError(502, `${service} request failed or timed out. A write may have succeeded; check before retrying.`);
  }
  if (!response.ok) {
    throw new HttpError(response.status >= 400 && response.status < 600 ? response.status : 502, `${service} returned HTTP ${response.status}.`);
  }
  if (response.status === 204) return null;
  try {
    return await response.json();
  } catch {
    throw new HttpError(502, `${service} returned an invalid JSON response.`);
  }
}
