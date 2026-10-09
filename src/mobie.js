import { HttpError, requestJson } from './http.js';

function location(value, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new HttpError(400, `${name} must be a location object.`);
  if (typeof value.id === 'string' && value.id.trim()) return { id: value.id.trim() };
  if (!Number.isFinite(value.longitude) || Math.abs(value.longitude) > 180 ||
      !Number.isFinite(value.latitude) || Math.abs(value.latitude) > 90) {
    throw new HttpError(400, `${name} needs numeric longitude (-180..180) and latitude (-90..90).`);
  }
  const result = { longitude: value.longitude, latitude: value.latitude };
  for (const key of ['publicName', 'addressLine']) {
    if (value[key] !== undefined) {
      if (typeof value[key] !== 'string' || value[key].length > 500) throw new HttpError(400, `${name}.${key} must be a string of at most 500 characters.`);
      result[key] = value[key];
    }
  }
  return result;
}

export function ridePayload(value) {
  if (!value || typeof value !== 'object') throw new HttpError(400, 'A ride request object is required.');
  if (typeof value.time !== 'string' || !/T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/.test(value.time) || !Number.isFinite(Date.parse(value.time))) {
    throw new HttpError(400, 'time must be an ISO-8601 datetime with Z or an explicit offset (e.g. +02:00).');
  }
  const seats = value.seatsRequested ?? 1;
  if (!Number.isInteger(seats) || seats < 1 || seats > 8) throw new HttpError(400, 'seatsRequested must be an integer from 1 to 8.');
  return { departure: location(value.departure, 'departure'), destination: location(value.destination, 'destination'), time: value.time, seatsRequested: seats };
}

function ridePath(id) {
  if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(id)) throw new HttpError(400, 'Invalid ride ID. Use ride.id from a search result.');
  return `/rides/${encodeURIComponent(id)}`;
}

export function createMobieClient({ baseUrl, getAccessToken, fetch = globalThis.fetch }) {
  async function request(path, method = 'GET', body) {
    return requestJson(`${baseUrl.replace(/\/$/, '')}${path}`, {
      method,
      headers: { Authorization: `Bearer ${await getAccessToken()}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }, { fetch, service: 'mobie API' });
  }
  return {
    me: () => request('/me'),
    async searchRides(payload) { return request('/rides/search', 'POST', ridePayload(payload)); },
    // Driver-only endpoint. Before joining, passengers use the search result for details.
    async driverRideDetails(id) { return request(ridePath(id)); },
    // Requires an approved booking, not merely a submitted join request.
    async riderRideDetails(id) { return request(`${ridePath(id)}/rider-detail`); },
    async joinRide(id, payload, { confirmed = false } = {}) {
      if (confirmed !== true) throw new HttpError(400, 'Explicit caller confirmation is required (confirmed: true).');
      return request(`${ridePath(id)}/join-detailed`, 'POST', ridePayload(payload));
    },
  };
}
