// ============================================================
// Kesner-Wolford Estate — Gmail PDF → Drive OCR + Contact Log
// Run: runAll()
// Requires: Drive API v2 enabled under Services in the editor
// ============================================================

var SENDER_EMAIL     = 'wvrealestatescans2@gmail.com';
var SHEET_NAME       = 'Kesner Wolford Contact Log';
var SHEET_TAB        = 'Contacts';
var DEST_FOLDER_NAME = '02_Estate_Administration';
var PARENT_FOLDER_NAME = 'Carl Wolford - Shirley Kesner Estate';
var PROP_KEY         = 'processedMsgIds';  // tracks already-handled messages

// ---------------------------------------------------------------------------
// ENTRY POINT
// ---------------------------------------------------------------------------
function runAll() {
  var sheet     = getOrCreateSheet_();
  var destId    = getDestFolderId_();
  var processed = getProcessedIds_();
  var newIds    = [];

  var threads = GmailApp.search('from:' + SENDER_EMAIL + ' has:attachment');
  Logger.log('Threads found: ' + threads.length);

  threads.forEach(function(thread) {
    thread.getMessages().forEach(function(msg) {
      var msgId = msg.getId();
      if (processed[msgId]) {
        Logger.log('Skipping (already done): ' + msgId);
        return;
      }

      var hadPdf = false;
      msg.getAttachments().forEach(function(att) {
        if (att.getContentType() !== 'application/pdf') return;

        var dateStr  = Utilities.formatDate(msg.getDate(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
        var safeName = att.getName().replace(/[^a-zA-Z0-9_\-\.]/g, '_');
        var baseName = dateStr + '_' + safeName;

        // Upload PDF blob to estate folder
        var pdfBlob = att.copyBlob().setName(baseName);
        var pdfFile = DriveApp.createFile(pdfBlob);
        moveFileToFolder_(pdfFile.getId(), destId);

        // Upload again with OCR to get readable text
        var ocrDocId = uploadWithOcr_(att, baseName);
        if (ocrDocId) {
          moveFileToFolder_(ocrDocId, destId);
          var text = DocumentApp.openById(ocrDocId).getBody().getText();
          extractAndLog_(text, baseName, msg.getDate(), sheet);
        } else {
          Logger.log('OCR failed for: ' + baseName);
        }

        Logger.log('Processed: ' + baseName);
        hadPdf = true;
      });

      if (hadPdf) newIds.push(msgId);
    });
  });

  saveProcessedIds_(processed, newIds);
  Logger.log('Done. New messages handled: ' + newIds.length);
}

// ---------------------------------------------------------------------------
// DEDUPLICATION  (persisted across runs via PropertiesService)
// ---------------------------------------------------------------------------
function getProcessedIds_() {
  var raw = PropertiesService.getScriptProperties().getProperty(PROP_KEY);
  if (!raw) return {};
  try { return JSON.parse(raw); } catch(e) { return {}; }
}

function saveProcessedIds_(existing, newIds) {
  newIds.forEach(function(id) { existing[id] = true; });
  PropertiesService.getScriptProperties().setProperty(PROP_KEY, JSON.stringify(existing));
}

// ---------------------------------------------------------------------------
// SHEET
// ---------------------------------------------------------------------------
function getOrCreateSheet_() {
  var files = DriveApp.getFilesByName(SHEET_NAME);
  var ss;
  if (files.hasNext()) {
    ss = SpreadsheetApp.openById(files.next().getId());
  } else {
    ss = SpreadsheetApp.create(SHEET_NAME);
  }

  var tab = ss.getSheetByName(SHEET_TAB);
  if (!tab) {
    tab = ss.getActiveSheet().setName(SHEET_TAB);
    tab.appendRow(['Date', 'Source File', 'Info Type', 'Value', 'Context']);
    tab.setFrozenRows(1);
    tab.getRange('1:1').setFontWeight('bold');
  }
  return tab;
}

// ---------------------------------------------------------------------------
// DRIVE FOLDER
// ---------------------------------------------------------------------------
function getDestFolderId_() {
  var parentIter = DriveApp.getFoldersByName(PARENT_FOLDER_NAME);
  var parent = parentIter.hasNext() ? parentIter.next() : DriveApp.createFolder(PARENT_FOLDER_NAME);

  var destIter = parent.getFoldersByName(DEST_FOLDER_NAME);
  var dest = destIter.hasNext() ? destIter.next() : parent.createFolder(DEST_FOLDER_NAME);

  return dest.getId();
}

function moveFileToFolder_(fileId, folderId) {
  var file   = DriveApp.getFileById(fileId);
  var target = DriveApp.getFolderById(folderId);
  target.addFile(file);
  DriveApp.getRootFolder().removeFile(file);
}

// ---------------------------------------------------------------------------
// OCR UPLOAD  (Drive API v2 — must be enabled as a Service)
// ---------------------------------------------------------------------------
function uploadWithOcr_(attachment, baseName) {
  try {
    var blob     = attachment.copyBlob().setName(baseName);
    var resource = { title: baseName + '_OCR', mimeType: 'application/vnd.google-apps.document' };
    var file     = Drive.Files.insert(resource, blob, { ocr: true, ocrLanguage: 'en' });
    return file.id;
  } catch (e) {
    Logger.log('OCR error: ' + e.message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// CONTACT EXTRACTION
// ---------------------------------------------------------------------------
function extractAndLog_(text, fileName, date, sheet) {
  var dateStr = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var rows    = [];

  // US phone numbers: (304) 555-1234 / 304-555-1234 / 304.555.1234
  var phoneRe = /\(?\d{3}\)?[\s.\-]\d{3}[\s.\-]\d{4}/g;
  (text.match(phoneRe) || []).forEach(function(p) {
    rows.push([dateStr, fileName, 'PHONE', p.trim(), contextAround_(text, p, 80)]);
  });

  // Email addresses
  var emailRe = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
  (text.match(emailRe) || []).forEach(function(e) {
    rows.push([dateStr, fileName, 'EMAIL', e.trim(), contextAround_(text, e, 80)]);
  });

  // Lines containing key names
  var keywords = ['Shirley', 'Kesner', 'Wolford'];
  text.split('\n').forEach(function(line) {
    keywords.forEach(function(kw) {
      if (line.indexOf(kw) !== -1 && line.trim().length > 0) {
        rows.push([dateStr, fileName, 'CONTEXT_' + kw.toUpperCase(), line.trim(), '']);
      }
    });
  });

  if (rows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 5).setValues(rows);
  }
}

function contextAround_(text, needle, radius) {
  var idx = text.indexOf(needle);
  if (idx === -1) return '';
  var start = Math.max(0, idx - radius);
  var end   = Math.min(text.length, idx + needle.length + radius);
  return text.slice(start, end).replace(/\n/g, ' ');
}
