## Google Sheets Setup

1. Open your Google Sheet.
2. Create columns in the first row:
   `Name`, `Attendance`, `Source`, `SentAt`
3. Open `Extensions` -> `Apps Script`.
4. Replace the default script with the code from [google-apps-script.gs](/Users/amirgali.turalinov/Projects/holiday/google-apps-script.gs).
5. Click `Deploy` -> `New deployment`.
6. Choose `Web app`.
7. Set access to `Anyone`.
8. Copy the web app URL.
9. Paste that URL into `formEndpoint` in [script.js](/Users/amirgali.turalinov/Projects/holiday/script.js).

After that, RSVP answers from the site will be sent to the sheet.
