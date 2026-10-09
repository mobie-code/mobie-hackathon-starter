# mobie Voice AI Challenge

## Kurzbeschreibung

Entwickelt in 24 Stunden eine Lösung mit einem KI-Telefonassistenten eurer Wahl, die Menschen bei der Suche und Buchung einer Mitfahrgelegenheit unterstützt. Der Assistent versteht deutschsprachige Fahrtwünsche, klärt Start und Ziel mithilfe von Mapbox und erstellt nach ausdrücklicher Zustimmung eine echte Buchungsanfrage über die mobie-REST-API. Optional könnt ihr einen Matcher entwickeln, der falsch verstandene österreichische Straßen- und Ortsnamen erkennt und korrigiert.

## Short description

Build a solution using an AI phone assistant of your choice in 24 hours. It should understand German-speaking callers' travel needs, resolve start and destination using Mapbox, find suitable rides and submit a real booking request through the mobie REST API after explicit confirmation. Optionally, develop a matcher that identifies and corrects mistranscribed Austrian street and place names.

## Aufgabenstellung

Bindet einen telefonisch erreichbaren KI-Assistenten an die mobie-Staging-API an. Erfasst Start, Ziel, Zeitpunkt und benötigte Sitzplätze. Bestimmt eindeutige Orte, fragt bei Unklarheiten nach und übergebt deren Koordinaten an die Fahrtsuche. Erklärt die Ergebnisse und beantwortet Rückfragen anhand der gefundenen Fahrten.

Nach der Auswahl fasst ihr Fahrt, Abholort, Ziel, Zeitpunkt, Sitzplätze und einen verfügbaren Preis zusammen. Erst nach ausdrücklicher Zustimmung erstellt ihr die Buchungsanfrage. Diese muss tatsächlich im Backend erscheinen. Der Fahrer muss die Anfrage danach noch bestätigen; kommuniziert diesen Status korrekt.

Verwendet einen eigenen Mapbox-Zugang. Der Starter zeigt Adress-/Straßen-Geocoding mit dauerhaft speicherbaren Ergebnissen. Die verwendete Datenquelle muss das Speichern der Ortsdaten in mobie erlauben. Telefonieplattform, Gesprächsführung und Implementierung bleiben euch überlassen. Mindestens eine Person pro Team sollte Deutsch sprechen.

Ein zusätzlicher Matcher für fehlerhafte Transkriptionen ist optional. Der Telefonassistent kann dafür euren Server aufrufen; ihr entscheidet anhand realer Ortsdaten und gegebenenfalls einer Rückfrage, welche Koordinaten an mobie gesendet werden.

Abgabe: ein funktionierender Telefonassistent und eine kurze Beschreibung von Aufbau, API-Nutzung und bekannten Grenzen. Die Organisatoren teilen Zugangsdaten, Staging-App, Testfahrten, Telefonie-/Credit-Regelung und Abgabezeit separat mit.
