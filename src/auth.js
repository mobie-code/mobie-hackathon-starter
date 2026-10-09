import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { HttpError, requestJson } from './http.js';

export function equalSecret(actual, expected) {
  if (typeof actual !== 'string' || typeof expected !== 'string' || !expected) return false;
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createAuth(config, { fetch = globalThis.fetch, now = Date.now } = {}) {
  // ponytail: one test passenger per process; add user-scoped storage for multi-user production use.
  let tokens = null;
  let pending = null;
  let refreshing = null;
  let generation = 0;
  const loginRequired = () => new HttpError(401, 'Login required. Open the starter and sign in again.');

  function logout() {
    generation++;
    tokens = null;
    pending = null;
    refreshing = null;
  }

  async function exchange(form) {
    return requestJson(`${config.issuer}/oauth/token`, {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: config.clientId, ...form }).toString(),
    }, { fetch, service: 'Auth0' });
  }

  function acceptTokens(result, version) {
    if (version !== generation) throw loginRequired();
    if (!result || typeof result.access_token !== 'string' || !result.access_token ||
        typeof result.refresh_token !== 'string' || !result.refresh_token ||
        result.token_type?.toLowerCase() !== 'bearer' ||
        !Number.isFinite(result.expires_in) || result.expires_in <= 0) {
      throw new HttpError(401, 'Auth0 did not return usable access/refresh tokens. Check offline_access and Refresh Token Rotation.');
    }
    tokens = { access: result.access_token, refresh: result.refresh_token, expiresAt: now() + result.expires_in * 1000 };
  }

  return {
    beginLogin() {
      logout();
      const state = randomBytes(32).toString('base64url');
      const verifier = randomBytes(32).toString('base64url');
      pending = { state, verifier, expiresAt: now() + 600_000 };
      const url = new URL(`${config.issuer}/authorize`);
      url.search = new URLSearchParams({
        response_type: 'code', client_id: config.clientId, audience: config.audience,
        redirect_uri: config.redirectUri, scope: 'openid profile email offline_access',
        code_challenge_method: 'S256', code_challenge: createHash('sha256').update(verifier).digest('base64url'),
        state, prompt: 'login',
      }).toString();
      return { url: url.toString(), state };
    },
    async finishLogin({ code, state, cookieState }) {
      if (!pending || pending.expiresAt <= now() || !equalSecret(state, pending.state) || !equalSecret(cookieState, pending.state)) {
        throw new HttpError(400, 'Invalid or expired login state. Start login again in the same browser.');
      }
      const verifier = pending.verifier;
      pending = null; // Authorization codes are single-use, including failed exchanges.
      if (typeof code !== 'string' || !code) throw new HttpError(400, 'Missing authorization code. Start login again.');
      const version = generation;
      acceptTokens(await exchange({ grant_type: 'authorization_code', code, code_verifier: verifier, redirect_uri: config.redirectUri }), version);
    },
    async getAccessToken() {
      if (tokens && tokens.expiresAt - now() > 30_000) return tokens.access;
      if (refreshing) return refreshing;
      if (!tokens?.refresh) throw loginRequired();
      const version = generation;
      const refresh = tokens.refresh;
      tokens = null; // Never reuse a rotating token after an ambiguous network failure.
      const task = (async () => {
        try {
          acceptTokens(await exchange({ grant_type: 'refresh_token', refresh_token: refresh }), version);
          return tokens.access;
        } catch {
          if (version === generation) tokens = null;
          throw loginRequired();
        }
      })();
      refreshing = task;
      try { return await task; }
      finally { if (refreshing === task) refreshing = null; }
    },
    status() {
      return { authenticated: Boolean(tokens || refreshing), expiresAt: tokens ? new Date(tokens.expiresAt).toISOString() : null };
    },
    logout,
  };
}
