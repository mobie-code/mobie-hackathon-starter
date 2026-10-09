import { HttpError, requestJson } from './http.js';

export function createMapboxClient({ token, fetch = globalThis.fetch }) {
  return {
    async searchLocations(query) {
      if (typeof query !== 'string' || !query.trim() || query.length > 256 || query.includes(';') || query.trim().split(/\s+/).length > 20) {
        throw new HttpError(400, 'query must contain 1–256 characters, at most 20 words and no semicolon.');
      }
      if (!token) throw new HttpError(503, 'Set your own MAPBOX_ACCESS_TOKEN in .env to use geocoding.');
      // mobie stores locations even during search. Use permanent geocoding accordingly.
      // This covers addresses/streets/places; POI search needs a separate data source/agreement.
      const url = new URL('https://api.mapbox.com/search/geocode/v6/forward');
      url.search = new URLSearchParams({ q: query.trim(), access_token: token, country: 'AT', language: 'de', limit: '5', autocomplete: 'false', permanent: 'true' }).toString();
      const result = await requestJson(url.toString(), {}, { fetch, service: 'Mapbox' });
      if (!Array.isArray(result?.features)) throw new HttpError(502, 'Mapbox returned an unexpected response.');
      const candidates = result.features.map(feature => {
        const p = feature.properties ?? {};
        const coordinates = p.coordinates ?? {};
        return {
          publicName: p.name_preferred ?? p.name ?? '',
          addressLine: p.full_address ?? [p.name, p.place_formatted].filter(Boolean).join(', '),
          longitude: coordinates.longitude ?? feature.geometry?.coordinates?.[0],
          latitude: coordinates.latitude ?? feature.geometry?.coordinates?.[1],
        };
      }).filter(p => Number.isFinite(p.longitude) && Number.isFinite(p.latitude));
      return { candidates, attribution: result.attribution ?? '' };
    },
  };
}
