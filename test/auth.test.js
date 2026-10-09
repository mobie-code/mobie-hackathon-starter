import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createAuth } from '../src/auth.js';

const config = { issuer: 'https://tenant.example', clientId: 'public-client', audience: 'https://staging.example', redirectUri: 'http://localhost:3000/callback' };
const tokenResponse = (access, refresh, expires = 120) => Response.json({ access_token: access, refresh_token: refresh, token_type: 'Bearer', expires_in: expires });
async function login(auth) {
  const { state } = auth.beginLogin();
  await auth.finishLogin({ code: 'code', state, cookieState: state });
}

test('authorization code exchange binds state to the browser and uses the matching PKCE verifier', async () => {
  let sent;
  const auth = createAuth(config, { fetch: async (url, options) => {
    assert.equal(url, 'https://tenant.example/oauth/token');
    sent = new URLSearchParams(options.body);
    return tokenResponse('access-1', 'refresh-1');
  } });
  const { url, state } = auth.beginLogin();
  const params = new URL(url).searchParams;
  assert.equal(params.get('response_type'), 'code');
  assert.equal(params.get('code_challenge_method'), 'S256');
  assert.equal(params.get('audience'), 'https://staging.example');
  assert.match(params.get('scope'), /offline_access/);
  await assert.rejects(auth.finishLogin({ code: 'code', state, cookieState: 'other-browser' }), /state/i);
  assert.equal(sent, undefined);
  await auth.finishLogin({ code: 'code', state, cookieState: state });
  assert.equal(sent.get('grant_type'), 'authorization_code');
  assert.equal(sent.get('redirect_uri'), config.redirectUri);
  assert.equal(createHash('sha256').update(sent.get('code_verifier')).digest('base64url'), params.get('code_challenge'));
  assert.equal(await auth.getAccessToken(), 'access-1');
  await assert.rejects(auth.finishLogin({ code: 'code', state, cookieState: state }), /state/i);
  assert.doesNotMatch(JSON.stringify(auth.status()), /access-1|refresh-1/);
});

test('expired login transactions cannot be exchanged', async () => {
  let now = 0;
  const auth = createAuth(config, { now: () => now, fetch: async () => assert.fail('No token request expected') });
  const { state } = auth.beginLogin();
  now = 11 * 60_000;
  await assert.rejects(auth.finishLogin({ code: 'code', state, cookieState: state }), /state|expired/i);
});

test('concurrent calls perform one refresh and subsequent refresh uses the rotated token', async () => {
  let now = 0;
  const refreshes = [];
  const auth = createAuth(config, { now: () => now, fetch: async (_url, options) => {
    const form = new URLSearchParams(options.body);
    if (form.get('grant_type') === 'authorization_code') return tokenResponse('access-1', 'refresh-1');
    refreshes.push(form.get('refresh_token'));
    await new Promise(resolve => setTimeout(resolve, 10));
    return tokenResponse(`access-${refreshes.length + 1}`, `refresh-${refreshes.length + 1}`);
  } });
  await login(auth);
  now = 100_000;
  assert.deepEqual(await Promise.all([auth.getAccessToken(), auth.getAccessToken(), auth.getAccessToken()]), ['access-2', 'access-2', 'access-2']);
  now = 200_000;
  assert.equal(await auth.getAccessToken(), 'access-3');
  assert.deepEqual(refreshes, ['refresh-1', 'refresh-2']);
});

test('failed refresh requires login instead of reusing a possibly consumed refresh token', async () => {
  let now = 0;
  let calls = 0;
  const auth = createAuth(config, { now: () => now, fetch: async () => {
    calls++;
    if (calls === 1) return tokenResponse('access', 'secret-refresh');
    return Response.json({ error: 'invalid_grant', error_description: 'secret-refresh' }, { status: 400 });
  } });
  await login(auth);
  now = 100_000;
  await assert.rejects(auth.getAccessToken(), error => !error.message.includes('secret-refresh') && error.status === 401);
  await assert.rejects(auth.getAccessToken(), /login/i);
  assert.equal(calls, 2);
  assert.equal(auth.status().authenticated, false);
});

test('logout during refresh cannot resurrect the logged-out session', async () => {
  let now = 0;
  let release;
  const auth = createAuth(config, { now: () => now, fetch: async (_url, options) => {
    if (new URLSearchParams(options.body).get('grant_type') === 'authorization_code') return tokenResponse('old', 'refresh');
    return new Promise(resolve => { release = () => resolve(tokenResponse('new', 'rotated')); });
  } });
  await login(auth);
  now = 100_000;
  const pending = auth.getAccessToken();
  auth.logout();
  release();
  await assert.rejects(pending, /login|session/i);
  assert.equal(auth.status().authenticated, false);
});

test('missing refresh token is reported instead of promising automatic renewal', async () => {
  const auth = createAuth(config, { fetch: async () => tokenResponse('access', undefined) });
  await assert.rejects(login(auth), /offline_access|refresh/i);
  assert.equal(auth.status().authenticated, false);
});
