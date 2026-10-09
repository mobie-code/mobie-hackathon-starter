# mobie Voice AI Challenge

## Short description

Build a solution using an AI phone assistant of your choice in 24 hours. It should understand German-speaking callers' travel needs, resolve start and destination using Mapbox, find suitable rides and submit a real booking request through the mobie REST API after explicit confirmation. Optionally, develop a matcher that identifies and corrects mistranscribed Austrian street and place names.

## Your task

Connect a phone-accessible AI assistant to the mobie staging API. Collect the caller's starting point, destination, travel date and time, and required seats. Resolve locations unambiguously, ask follow-up questions when needed, and send their coordinates to the ride search. Explain the results and answer questions using the returned ride information.

Once the caller selects a ride, summarize the ride, pickup location, destination, time, seats and available price information. Submit the booking request only after explicit confirmation. The request must actually be stored in the backend. The driver still needs to approve it, so communicate the pending status accurately.

Use your own Mapbox account. The starter demonstrates address and street geocoding with results that may be stored permanently. Your data source must permit storing location data in mobie. You choose the phone platform, conversation design and implementation. At least one team member should speak German.

An additional matcher for transcription errors is optional. The phone assistant can call your server for this step; use actual location data and, when necessary, a follow-up question to decide which coordinates to send to mobie.

You will receive access to the mobie staging app for the hackathon. You can create as many test user accounts as you need, set up test rides and approve booking requests in the app. Use separate driver and passenger accounts; drivers need the appropriate approval and a vehicle before offering rides. Each running starter uses one signed-in passenger account at a time.

Submit a working phone assistant and a short description of its architecture, API usage and known limitations. Access details, the staging app, test rides, phone service and credit arrangements, and the submission deadline will be provided separately.
