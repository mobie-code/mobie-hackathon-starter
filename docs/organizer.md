# Organizer handoff

This repository is ready to configure; it does not provision accounts, phone numbers, Auth0 applications or test rides.

## Before distributing it

1. Configure the dedicated staging Auth0 public client as described in [authentication.md](authentication.md), including the **user client grant** required by the tenant's API policy. Supply the actual domain, client ID and audience. The example callback is `http://localhost:3000/callback`.
2. Supply staging app installation links. Registration is enabled in the checked-in Auth0 configuration; verify the live tenant. Give each team an approved test driver with a vehicle or approve their driver account. New users cannot necessarily offer rides immediately.
3. Supply a separate test passenger per team. The phone starter uses this account; the app can be used as the driver to create rides and approve requests. Do not search/book your own offered ride with the driver account.
4. Create a few free rides at known coordinates and future times matching the event. Paid rides require functioning test payment setup. Agree on how teams reset/cancel bookings or create fresh rides for repeat demos.
5. Teams provide their own Mapbox account/token. The included permanent geocoding requires an eligible account and may be billed. For POIs, agree on reusable data or the required provider arrangement; ordinary Search Box data cannot simply be persisted.
6. Supply phone platform accounts/number/credit arrangements and decide how team servers are exposed over HTTPS.
7. Share no real user data or production credentials. Team members need the public starter, not access to the private backend repository.

## One live acceptance run

Use the same setup the teams will receive:

- Start from a fresh clone on Node 22 or 24 and run `npm install`, `npm run setup`.
- Complete the browser login and verify `/api/me`.
- Confirm that refresh works with the actual Auth0 client (e.g. with a short staging test token lifetime or by waiting for expiry). Local tests exercise rotation but do not prove tenant configuration.
- Resolve actual test addresses and confirm their coordinates.
- Search a seeded ride from the passenger account and inspect the raw response.
- Ask for a booking, decline first, and verify no booking was created.
- Repeat and explicitly agree. Confirm the response contains `rideRequest` and that the request appears in the driver's staging app.
- Approve as driver, then verify passenger access to `/rides/{id}/rider-detail`.
- Repeat via a real telephone call; test ambiguous locations and no results.

TestFlight approval, Google Play tester access, active phone numbers and live tenant configuration cannot be verified from this repository. Distribute only links that you have tested on a participant device.

## Backend contract checked

The documentation was derived from the local backend on 2026-10-09 (RideController, SearchRidesRequest, CreateRideRequestPayload, JoinRideDetailedRequest, RideSuggestionDto, RideServiceImpl, RideRequestServiceImpl and RideMobileDetailsAssembler). A staging deployment can differ; run the acceptance sequence before the event.

Corrections from the initial planning discussion:

- `GET /rides/{id}` is **driver-only**. Passengers use search results before booking; `/rider-detail` requires an approved booking.
- Even a search with new coordinate payloads can persist location records and emit search events. Direct search is not strictly free of side effects.
- The starter calls the normal REST endpoints. It does not use the legacy voice webhook or its function names/response envelope.

Configure staging search/booking notifications for test use. No backend or Auth0 changes are made by the starter itself.
