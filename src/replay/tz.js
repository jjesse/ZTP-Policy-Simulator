'use strict';
// Wall-clock <-> UTC for an IANA zone using Intl (DST-aware, no dependencies).
const DEFAULT_TZ = 'America/New_York';
const fmts = new Map();
function fmt(tz) {
  if (!fmts.has(tz)) fmts.set(tz, new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  return fmts.get(tz);
}
function parts(ms, tz) {
  const o = {}; for (const p of fmt(tz).formatToParts(new Date(ms))) o[p.type] = p.value;
  return { y: +o.year, mo: +o.month, d: +o.day, h: +o.hour % 24, mi: +o.minute, s: +o.second };
}
const offsetMs = (ms, tz) => { const p = parts(ms, tz); return Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s) - Math.floor(ms / 1000) * 1000; };
// Wall-clock fields in tz -> epoch ms. Two passes handle DST transitions.
function zonedToUtc(y, mo, d, h, mi, s, tz = DEFAULT_TZ) {
  const guess = Date.UTC(y, mo - 1, d, h, mi, s);
  let ms = guess - offsetMs(guess, tz);
  ms = guess - offsetMs(ms, tz);
  return ms;
}
// YYYY-MM-DD of an instant in tz.
function dayIn(iso, tz = DEFAULT_TZ) {
  if (!iso) return 'unknown';
  const p = parts(Date.parse(iso), tz);
  return `${p.y}-${String(p.mo).padStart(2, '0')}-${String(p.d).padStart(2, '0')}`;
}
function validTz(tz) { try { fmt(tz); return true; } catch { return false; } }
module.exports = { DEFAULT_TZ, zonedToUtc, dayIn, validTz };
