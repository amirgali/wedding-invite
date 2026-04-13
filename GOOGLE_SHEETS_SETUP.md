## Google Sheets Setup

1. Open your Google Sheet.
2. Create columns in the first row:
   `Name`, `Attendance`, `Referer`, `FormId`, `Sent`, `RequestId`
3. Open `Extensions` -> `Apps Script`.
4. Replace the default script with the code from [google-apps-script.gs](/Users/amirgali.turalinov/Projects/holiday/google-apps-script.gs).
5. Click `Deploy` -> `New deployment`.
6. Choose `Web app`.
7. Set:
   `Execute as` -> `Me`
   `Who has access` -> `Anyone`
8. Click `Deploy` and grant access.
9. Copy the `Web app URL`.
10. Paste that URL into `formEndpoint` in [script.js](/Users/amirgali.turalinov/Projects/holiday/script.js).

Example:

```js
const SITE_CONFIG = {
  formEndpoint: "https://script.google.com/macros/s/XXXXXXXXXX/exec",
  musicUrl: "assets/love-theme.mp3"
};
```

After that, publish the site again. RSVP answers from the site will be sent to the sheet.
