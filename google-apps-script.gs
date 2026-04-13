function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = e.parameter;

  sheet.appendRow([
    data.name || "",
    data.attendance || "",
    data.referer || "",
    data.formid || "samui-rsvp-form",
    data.sent || new Date().toISOString(),
    data.requestid || Utilities.getUuid()
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
