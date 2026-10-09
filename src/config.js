export function loadConfig(env = process.env) {
  const required = name => {
    const value = env[name]?.trim();
    if (!value || value.includes('YOUR_')) throw new Error(`Set ${name} in .env (see .env.example).`);
    return value;
  };
  const domain = required('AUTH0_DOMAIN');
  if (!/^[a-zA-Z0-9.-]+$/.test(domain) || !domain.includes('.')) throw new Error('AUTH0_DOMAIN must be a hostname without protocol or path.');
  const redirect = new URL(env.AUTH0_REDIRECT_URI || 'http://localhost:3000/callback');
  if (redirect.pathname !== '/callback' || redirect.search || redirect.hash || redirect.username || redirect.password ||
      (redirect.protocol !== 'https:' && !(redirect.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(redirect.hostname)))) {
    throw new Error('AUTH0_REDIRECT_URI must end in /callback and use HTTPS (or HTTP on localhost).');
  }
  const base = new URL(env.MOBIE_API_URL || 'https://api-staging.mobie.at');
  if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash || base.pathname !== '/' || base.hostname === 'api.mobie.at') {
    throw new Error('MOBIE_API_URL must be an HTTPS staging origin, not the production API.');
  }
  const port = Number(env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer from 1 to 65535.');
  const apiKey = required('STARTER_API_KEY');
  if (apiKey.length < 32) throw new Error('STARTER_API_KEY must have at least 32 characters. Generate one with npm run setup.');
  return {
    issuer: `https://${domain}`, clientId: required('AUTH0_CLIENT_ID'), audience: required('AUTH0_AUDIENCE'),
    redirectUri: redirect.toString(), baseUrl: base.origin, apiKey, mapboxToken: env.MAPBOX_ACCESS_TOKEN?.trim() || '',
    port, host: env.HOST || '127.0.0.1',
  };
}
