/**
 * FitTrack — Google Apps Script Web App
 *
 * Deploy: Extensions → Apps Script → Deploy → New Deployment
 *   Type: Web app
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * Sheet names expected: Food, Weight, Workout, Walks, Profile
 * Each sheet's first row is a header row matching the field names in types.ts.
 * The "id" column is used as the unique key for update/delete.
 */

const SHEETS = ["Food", "Weight", "Workout", "Walks", "Profile"];

// ─── Entry points ───────────────────────────────────────────────────────────

function doGet(e) {
  const action = e.parameter.action;
  const params = JSON.parse(e.parameter.payload || "{}");

  try {
    switch (action) {
      case "getRows":
        return jsonResponse(getRows(params.sheet));
      default:
        return jsonResponse({ error: "Unknown action: " + action });
    }
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const { action, sheet, row, id } = body;

  try {
    switch (action) {
      case "appendRow":
        appendRow(sheet, row);
        return jsonResponse({ ok: true });
      case "updateRow":
        updateRow(sheet, row);
        return jsonResponse({ ok: true });
      case "deleteRow":
        deleteRow(sheet, id);
        return jsonResponse({ ok: true });
      case "saveProfile":
        saveProfile(row);
        return jsonResponse({ ok: true });
      default:
        return jsonResponse({ error: "Unknown action: " + action });
    }
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error("Sheet not found: " + name);
  return sheet;
}

function getRows(sheetName) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  const headers = data[0];
  return data.slice(1).map((row) => {
    const obj = {};
    headers.forEach((h, i) => {
      // Parse JSON-serialized complex fields (e.g. exercises array in Workout)
      const val = row[i];
      if (typeof val === "string" && (val.startsWith("[") || val.startsWith("{"))) {
        try { obj[h] = JSON.parse(val); } catch { obj[h] = val; }
      } else {
        obj[h] = val;
      }
    });
    return obj;
  });
}

function appendRow(sheetName, row) {
  const sheet = getSheet(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const values = headers.map((h) => {
    const v = row[h];
    return (typeof v === "object" && v !== null) ? JSON.stringify(v) : (v ?? "");
  });
  sheet.appendRow(values);
}

function updateRow(sheetName, row) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf("id");
  if (idCol === -1) throw new Error("No 'id' column in sheet: " + sheetName);

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(row.id)) {
      const values = headers.map((h) => {
        const v = row[h];
        return (typeof v === "object" && v !== null) ? JSON.stringify(v) : (v ?? "");
      });
      sheet.getRange(i + 1, 1, 1, headers.length).setValues([values]);
      return;
    }
  }
  throw new Error("Row not found with id: " + row.id);
}

function deleteRow(sheetName, id) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf("id");
  if (idCol === -1) throw new Error("No 'id' column in sheet: " + sheetName);

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(id)) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
  throw new Error("Row not found with id: " + id);
}

function saveProfile(profileData) {
  const sheet = getSheet("Profile");
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const values = headers.map((h) => profileData[h] ?? "");
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    sheet.appendRow(values);
  } else {
    sheet.getRange(2, 1, 1, headers.length).setValues([values]);
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── Setup helper (run once manually) ───────────────────────────────────────

function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const schemas = {
    Food:    ["id", "date", "time", "name", "calories", "protein", "carbs", "fat", "meal"],
    Weight:  ["id", "date", "weightKg", "note"],
    Workout: ["id", "date", "startTime", "durationMin", "exercises", "notes"],
    Walks:   ["id", "date", "startTime", "durationMin", "distanceKm", "steps", "calories", "route"],
    Profile: ["name", "avatarUrl", "heightCm", "goalWeightKg", "dailyCalorieGoal", "dailyStepGoal"],
  };

  for (const [name, headers] of Object.entries(schemas)) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  }
}
