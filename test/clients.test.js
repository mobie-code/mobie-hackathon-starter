import test from 'node:test';
import assert from 'node:assert/strict';
import { createMobieClient } from '../src/mobie.js';
import { createMapboxClient } from '../src/mapbox.js';

const ride = {
  departure: { publicName: 'Start', latitude: 48.2, longitude: 16.3 },
  destination: { publicName: 'End', latitude: 48.3, longitude: 16.4 },
  time: '2026-10-20T09:00:00+02:00', seatsRequested: 1,
};

test('REST search sends coordinates with a user access token and returns the raw suggestion array', async () => {
  const client = createMobieClient({ baseUrl: 'https://staging.example', getAccessToken: async () => 'user-access', fetch: async (url, options) => {
    assert.equal(url, 'https://staging.example/rides/search');
    assert.equal(options.headers.Authorization, 'Bearer user-access');
    assert.deepEqual(JSON.parse(options.body), ride);
    return Response.json([{ ride: { id: 'ride-1' }, estimatedPrice: 0 }]);
  } });
  assert.deepEqual(await client.searchRides(ride), [{ ride: { id: 'ride-1' }, estimatedPrice: 0 }]);
});

test('invalid coordinates, timezones and seat counts fail before calling upstream', async () => {
  const client = createMobieClient({ baseUrl: 'https://staging.example', getAccessToken: async () => assert.fail('No credentials needed for invalid input') });
  for (const payload of [
    { ...ride, departure: { latitude: '48.2', longitude: 16.3 } },
    { ...ride, destination: { latitude: 100, longitude: 16.3 } },
    { ...ride, seatsRequested: 0 },
    { ...ride, time: 'tomorrow' },
    { ...ride, time: '2026-10-20T09:00:00' },
  ]) await assert.rejects(client.searchRides(payload), error => error.status === 400);
});

test('booking requires explicit confirmation and never automatically retries a failed write', async () => {
  let calls = 0;
  const client = createMobieClient({ baseUrl: 'https://staging.example', getAccessToken: async () => 'access', fetch: async (url, options) => {
    calls++;
    assert.equal(url, 'https://staging.example/rides/ride-1/join-detailed');
    assert.deepEqual(JSON.parse(options.body), ride);
    return Response.json({ message: 'Already requested' }, { status: 409 });
  } });
  await assert.rejects(client.joinRide('ride-1', ride), /confirm/i);
  await assert.rejects(client.joinRide('ride-1', ride, { confirmed: 'true' }), /confirm/i);
  assert.equal(calls, 0);
  await assert.rejects(client.joinRide('ride-1', ride, { confirmed: true }), error => error.status === 409);
  assert.equal(calls, 1);
});

test('Mapbox results map longitude and latitude correctly without leaking provider IDs into mobie IDs', async () => {
  const client = createMapboxClient({ token: 'mapbox-secret', fetch: async (url) => {
    const parsed = new URL(url);
    assert.equal(parsed.pathname, '/search/geocode/v6/forward');
    assert.equal(parsed.searchParams.get('permanent'), 'true');
    assert.equal(parsed.searchParams.get('country'), 'AT');
    assert.equal(parsed.searchParams.get('q'), 'Wien Hauptstraße');
    return Response.json({ features: [{ id: 'mapbox.fake', geometry: { coordinates: [16.3, 48.2] }, properties: { name: 'Hauptstraße', full_address: 'Hauptstraße, Wien', coordinates: { longitude: 16.3, latitude: 48.2 } } }], attribution: 'Mapbox' });
  } });
  const result = await client.searchLocations('Wien Hauptstraße');
  assert.deepEqual(result, { candidates: [{ publicName: 'Hauptstraße', addressLine: 'Hauptstraße, Wien', longitude: 16.3, latitude: 48.2 }], attribution: 'Mapbox' });
  await assert.rejects(client.searchLocations(''), error => error.status === 400);
});
