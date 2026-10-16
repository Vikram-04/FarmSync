// server/src/services/priceApi.js
//
// Shared helper for the data.gov.in "Current Daily Price of Various Commodities
// from Various Markets (Mandi)" API. Used by the mandi seed script, and meant to be
// reused by the daily price job and by cycle creation.
//
// The API's commodity filter is a loose text match (a search for "Green gram" also
// returns Bengal Gram, Black Gram, etc.), so this helper keeps only records whose
// commodity equals the requested name exactly (ignoring case and extra spaces).
//
// Needs DATA_GOV_API_KEY in .env.

import axios from 'axios';

const API_URL =
  'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const PAGE_LIMIT = 1000; // records requested per call; the loop adapts if the API returns fewer
const MAX_PAGES = 200; // safety stop
const RETRIES = 3;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Trim and collapse repeated spaces ("Yaragatti  APMC" -> "Yaragatti APMC").
export const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

// Comparison key: cleaned and lower-cased.
export const nameKey = (s) => clean(s).toLowerCase();

// "15/10/2026" (DD/MM/YYYY) -> "2026-10-15", or null if it cannot be parsed.
export function parseArrivalDate(s) {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(clean(s));
  if (!m) return null;
  return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}

async function getPage(commodity, offset) {
  const apiKey = process.env.DATA_GOV_API_KEY;
  if (!apiKey) throw new Error('DATA_GOV_API_KEY is missing from .env');

  for (let attempt = 1; ; attempt += 1) {
    try {
      const { data } = await axios.get(API_URL, {
        params: {
          'api-key': apiKey,
          format: 'json',
          limit: PAGE_LIMIT,
          offset,
          'filters[commodity]': commodity,
        },
        timeout: 30000,
      });
      return data;
    } catch (err) {
      if (attempt >= RETRIES) throw err;
      await sleep(1000 * attempt);
    }
  }
}

// All current records for one commodity, across every state and market.
// Returns an array of:
//   { state, district, market, commodity, variety, grade, arrivalDate, modalPrice }
// - arrivalDate is "YYYY-MM-DD" (or null)
// - modalPrice is a number, or null when missing or zero
// Only records whose commodity exactly matches `commodity` are returned.
export async function fetchCommodityRecords(commodity) {
  const wanted = nameKey(commodity);
  const out = [];
  let offset = 0;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const data = await getPage(commodity, offset);
    const records = data.records || [];
    if (records.length === 0) break;

    for (const r of records) {
      if (nameKey(r.commodity) !== wanted) continue;
      const modal = Number(r.modal_price);
      out.push({
        state: clean(r.state),
        district: clean(r.district),
        market: clean(r.market),
        commodity: clean(r.commodity),
        variety: clean(r.variety),
        grade: clean(r.grade),
        arrivalDate: parseArrivalDate(r.arrival_date),
        modalPrice: Number.isFinite(modal) && modal > 0 ? modal : null,
      });
    }

    offset += records.length;
    if (offset >= Number(data.total)) break; // if total is missing, the loop ends on an empty page
  }
  return out;
}
