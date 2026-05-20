// ============================================================
// Kesner-Wolford Estate — Gmail PDF → Drive OCR + Contact Log
// Run: runAll()
// Requires: Drive API service enabled in Apps Script editor
// ============================================================

var SENDER_EMAIL   = 'wvrealestatescans2@gmail.com';
var SHEET_NAME     = 'Kesner Wolford Contact Log';
var DEST_FOLDER_NAME = '02_Estate_Administration';
var PARENT_FOLDER_NAME = 'Carl Wolford - Shirley Kesner Estate';

// ---------------------------------------------------------------------------
// ENTRY POINT
// ---------------------------------------------------------------------------
function runAll() {
  var sheet  = getOrCreateSheet_();
  var destId = getDestFolderId_();
  Logger.log('Destination folder ID: ' + destId);

  var threads = GmailApp.search('from:' + SENDER_EMAIL + ' has:attachment');
  Logger.log('Threads found: ' + threads.length);

  threads.forEach(function(thread) {
    thread.getMessages().forEach(function(msg) {
      msg.getAttachments().forEach(function(att) {
        if (att.getContentType() !== 'application/pdf') return;

        var dateStr = Utilities.formatDate(msg.getDate(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
        var safeName = att.getName().replace(/[^a-zA-Z0-9_\-\.]/g, '_');
        var finalName = dateStr + '_' + safeName;

        // Upload with OCR so Drive can read text inside the scanned PDF
        var ocrDocId = uploadWithOcr_(att, finalName);
        if (!ocrDocId) {
          Logger.log('OCR upload failed for: ' + finalName);
          return;
        }

        // Move the OCR Google Doc into the estate folder
        moveFileToFolder_(ocrDocId, destId);

        // Also save the original PDF blob into the same folder
        var pdfBlob = att.copyBlob().setName(finalName);
        var pdfFile = DriveApp.createFile(pdfBlob);
        moveFileToFolder_(pdfFile.getId(), destId);

        // Extract text from the OCR doc and mine contact info
        var text = DocumentApp.openById(ocrDocId).getBody().getText();
        extractAndLog_(text, finalName, msg.getDate(), sheet);

        Logger.log('Processed: ' + finalName);
      });
    });
  });

  Logger.log('Done. Check sheet: ' + SHEET_NAME);
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
    var hdr = ss.getActiveSheet();
    hdr.appendRow(['Date', 'Source File', 'Info Type', 'Value', 'Context']);
    hdr.setFrozenRows(1);
  }
  return ss.getActiveSheet();
}

// ---------------------------------------------------------------------------
// DRIVE FOLDER
// ---------------------------------------------------------------------------
function getDestFolderId_() {
  // Walk: root → PARENT_FOLDER_NAME → DEST_FOLDER_NAME
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
  // Remove from root so it only lives in the target folder
  DriveApp.getRootFolder().removeFile(file);
}

// ---------------------------------------------------------------------------
// OCR UPLOAD  (uses Drive API v2 — must be enabled as a Service)
// ---------------------------------------------------------------------------
function uploadWithOcr_(attachment, fileName) {
  try {
    var blob = attachment.copyBlob().setName(fileName);
    var resource = { title: fileName + '_OCR', mimeType: 'application/vnd.google-apps.document' };
    var file = Drive.Files.insert(resource, blob, { ocr: true, ocrLanguage: 'en' });
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

  // Phone numbers  (matches US formats: (304) 555-1234 / 304-555-1234 / 3045551234)
  var phoneRe = /(\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]\d{4})/g;
  var phones  = text.match(phoneRe) || [];
  phones.forEach(function(p) {
    sheet.appendRow([dateStr, fileName, 'PHONE', p.trim(), contextAround_(text, p, 80)]);
  });

  // Email addresses
  var emailRe = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
  var emails  = text.match(emailRe) || [];
  emails.forEach(function(e) {
    sheet.appendRow([dateStr, fileName, 'EMAIL', e.trim(), contextAround_(text, e, 80)]);
  });

  // Lines containing key names — useful for signatures / headers
  var keywords = ['Shirley', 'Kesner', 'Wolford'];
  var lines = text.split('\n');
  lines.forEach(function(line) {
    keywords.forEach(function(kw) {
      if (line.indexOf(kw) !== -1) {
        sheet.appendRow([dateStr, fileName, 'CONTEXT_' + kw.toUpperCase(), line.trim(), '']);
      }
    });
  });
}

// Return up to `radius` chars of text surrounding `needle`
function contextAround_(text, needle, radius) {
  var idx = text.indexOf(needle);
  if (idx === -1) return '';
  var start = Math.max(0, idx - radius);
  var end   = Math.min(text.length, idx + needle.length + radius);
  return text.slice(start, end).replace(/\n/g, ' ');
}
