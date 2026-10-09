# mobie Voice AI Challenge

## Short description

Build a solution using an AI phone assistant of your choice in 24 hours. It should understand German-speaking callers' travel needs, resolve start and destination using Mapbox or another geocoding or point-of-interest (POI) search service, find suitable rides and submit a real booking request through the mobie REST API after explicit confirmation. Optionally, develop a matcher that identifies and corrects mistranscribed Austrian street and place names.

## Your task

Connect a phone-accessible AI assistant to the mobie staging API. Collect the caller's starting point, destination, travel date and time, and required seats. Resolve locations unambiguously, ask follow-up questions when needed, and send their coordinates to the ride search. Explain the results and answer questions using the returned ride information.

Once the caller selects a ride, summarize the ride, pickup location, destination, time, seats and available price information. Submit the booking request only after explicit confirmation. The request must actually be stored in the backend. The driver still needs to approve it, so communicate the pending status accurately.

Use Mapbox or another geocoding service, POI search API or suitable location dataset, with your own account or credentials where required. Mapbox is optional: the starter demonstrates address and street geocoding, and you can extend or replace it to search for landmarks, stations and other points of interest. Send the resolved coordinates to mobie. Your data source must permit storing location data in mobie. You choose the phone platform, conversation design and implementation. At least one team member should speak German.

An additional matcher for transcription errors is optional. The phone assistant can call your server for this step; use actual location data and, when necessary, a follow-up question to decide which coordinates to send to mobie.

You will receive access to the mobie staging app for the hackathon. You can create as many test user accounts as you need, set up test rides and approve booking requests in the app. Use separate driver and passenger accounts; drivers need the appropriate approval and a vehicle before offering rides. Each running starter uses one signed-in passenger account at a time.

For this challenge, the passenger account signed into the starter represents the caller. All calls to that starter search and book using this account, regardless of the incoming phone number. The team server already handles the API requests, but automatic phone-number matching to individual mobie users is not implemented or required. Matching callers to their own accounts, with appropriate identity verification and authorization, is a possible future extension.

Submit a working phone assistant and a short description of its architecture, API usage and known limitations. Access details, the staging app, test rides, phone service and credit arrangements, and the submission deadline will be provided separately.
