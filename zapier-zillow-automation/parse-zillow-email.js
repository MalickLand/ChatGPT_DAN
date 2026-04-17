// Zapier "Code by Zapier" step — parses Zillow alert emails into structured fields.
// Input Data keys: email_subject, email_body, email_date

const subject = inputData.email_subject || "";
const body = inputData.email_body || "";
const date = inputData.email_date || "";

function extractPrice(text) {
  const match = text.match(/\$[\d,]+/);
  return match ? match[0] : "Not found";
}

function extractAddress(text) {
  const patterns = [
    /(\d{1,6}\s+[\w\s]+(?:St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Ln|Lane|Ct|Court|Way|Blvd|Pike|Hwy|Highway|Rt|Route)\.?(?:\s*#?\s*\w+)?)/i,
    /(\d{1,6}\s+[\w\s]+,\s*(?:Hampshire|Mineral|Hardy)\s+County)/i,
    /(\d{1,6}\s+[\w\s]+,\s*\w+,\s*WV\s*\d{5})/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return "See listing";
}

function extractCounty(text) {
  const counties = ["Hampshire", "Mineral", "Hardy"];
  for (const county of counties) {
    if (text.toLowerCase().includes(county.toLowerCase())) {
      return county + " County, WV";
    }
  }
  return "WV (county not identified)";
}

function extractBedrooms(text) {
  const match = text.match(/(\d+)\s*(?:bed|br|bedroom)/i);
  return match ? match[1] : "N/A";
}

function extractBathrooms(text) {
  const match = text.match(/([\d.]+)\s*(?:bath|ba|bathroom)/i);
  return match ? match[1] : "N/A";
}

function extractSqft(text) {
  const match = text.match(/([\d,]+)\s*(?:sq\.?\s*ft|sqft|square\s*feet)/i);
  return match ? match[1] : "N/A";
}

function extractAcreage(text) {
  const match = text.match(/([\d.]+)\s*(?:acre|ac)/i);
  return match ? match[1] + " acres" : "N/A";
}

function extractLotSize(text) {
  const acreMatch = text.match(/([\d.]+)\s*(?:acre|ac)\s*(?:lot|land|parcel)?/i);
  if (acreMatch) return acreMatch[1] + " acres";
  const sqftMatch = text.match(/([\d,]+)\s*(?:sq\.?\s*ft|sqft)\s*lot/i);
  if (sqftMatch) return sqftMatch[1] + " sqft lot";
  return "N/A";
}

function extractUrl(text) {
  const match = text.match(/(https?:\/\/(?:www\.)?zillow\.com\/homedetails\/[^\s"<>]+)/i);
  if (match) return match[1];
  const genericMatch = text.match(/(https?:\/\/(?:www\.)?zillow\.com\/[^\s"<>]+)/i);
  return genericMatch ? genericMatch[1] : "Not found";
}

function extractZoning(text) {
  const match = text.match(/(?:zon(?:ed?|ing))\s*[:\-]?\s*([\w\s\-]+)/i);
  return match ? match[1].trim() : "Not specified";
}

function cleanBody(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\s+$/gm, "")
    .trim();
}

output = {
  subject: subject,
  date: date,
  price: extractPrice(body || subject),
  address: extractAddress(body || subject),
  county: extractCounty(body + " " + subject),
  bedrooms: extractBedrooms(body),
  bathrooms: extractBathrooms(body),
  sqft: extractSqft(body),
  acreage: extractAcreage(body),
  lot_size: extractLotSize(body),
  zoning: extractZoning(body),
  url: extractUrl(body),
  cleaned_body: cleanBody(body),
};
