#!/usr/bin/env node
/**
 * WiFi navigation rooms sync check — Qvacell (web repo).
 *
 * This repo doesn't bundle its own copy of wifi_navigation_rooms.json — the
 * canonical copies live in the iOS (qvacell-ios) and Android (qvacell-apk)
 * repos. This script fetches BOTH of those remotely (hardcoded raw GitHub
 * URLs, since there's no local file to read here) and diffs each against a
 * fresh scrape of ETECSA's own "Navigation rooms and public spaces (WIFI)"
 * directory, reporting added/removed rooms or changed position counts per
 * platform.
 *
 * This intentionally does NOT check whether iOS and Android agree with each
 * other — that's what cross-platform-sync-check.yml in each of those repos
 * already does. This only checks each against the ETECSA source of truth.
 *
 * ETECSA's site may not be reachable from wherever this runs (GitHub-hosted
 * runners are outside Cuba, and some sites block known cloud/datacenter IP
 * ranges even though they're open to regular visitors). Reachability is
 * checked ONCE, up front, with a short timeout — if that fails, the script
 * exits immediately (exit 2) instead of burning Actions minutes retrying all
 * 16 province pages one by one, twice over.
 *
 * Zero dependencies. Node 18+ (uses global fetch).
 * Exit 0 = both in sync. Exit 1 = drift found in at least one platform.
 * Exit 2 = ETECSA unreachable (inconclusive).
 *
 * Local testing: node .github/scripts/check-wifi-rooms-sync.mjs
 */

import fs from "node:fs";

const SOURCES = [
  {
    label: "iOS (qvacell-ios)",
    url: "https://raw.githubusercontent.com/albertolicea00/Qvacell-ios/main/Qvacell/wifi_navigation_rooms.json",
  },
  {
    label: "Android (qvacell-apk)",
    url: "https://raw.githubusercontent.com/albertolicea00/Qvacell-apk/main/app/src/main/assets/wifi_navigation_rooms.json",
  },
];

const BASE_URL = "https://www.etecsa.cu/en/rooms-public-spaces";
const FETCH_TIMEOUT_MS = 15_000;
const REACHABILITY_TIMEOUT_MS = 10_000;
const DELAY_BETWEEN_REQUESTS_MS = 500;

// Same province → `provincia` id mapping documented in each app's README §
// Navigation Rooms & Public WIFI Spaces — keep all three in sync if ETECSA
// ever renumbers these.
const PROVINCE_IDS = {
  "Pinar del Río": 49,
  Artemisa: 33,
  "La Habana": 27,
  "Isla de la Juventud": 29,
  Mayabeque: 200,
  Matanzas: 212,
  Cienfuegos: 226,
  "Villa Clara": 235,
  "Sancti Spíritus": 249,
  "Ciego de Ávila": 258,
  Camagüey: 269,
  "Las Tunas": 283,
  Granma: 292,
  Holguín: 306,
  "Santiago de Cuba": 321,
  Guantánamo: 331,
};

const ROOM_ITEM_RE =
  /<h5 class="azulclaro-salas">([^<]*)<\/h5><p>([^<]*)<\/p><\/div><div class="col-4\s+offset-1"><p class="azulclaro-salas"><bold>\s*(\d+)\s*<\/bold>\s*positions/g;

const lines = [];
const say = (s = "") => lines.push(s);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { "user-agent": "wifi-rooms-sync-check" },
    });
  } finally {
    clearTimeout(timer);
  }
}

/** One cheap request before touching all 16 province pages. */
async function checkReachable() {
  try {
    const res = await fetchWithTimeout("https://www.etecsa.cu/", REACHABILITY_TIMEOUT_MS);
    return res.ok || res.status < 500; // any real HTTP response counts as "reachable"
  } catch {
    return false;
  }
}

function parseRooms(html) {
  const rooms = [];
  for (const m of html.matchAll(ROOM_ITEM_RE)) {
    rooms.push({ name: m[1].trim(), address: m[2].trim(), positions: parseInt(m[3], 10) });
  }
  return rooms;
}

// ETECSA's page has inconsistent double-spacing inside addresses (e.g. "62D  e/" vs "62D e/")
// that means nothing content-wise — collapse whitespace before keying so that doesn't read as
// drift on its own.
const normalizeSpace = (s) => s.replace(/\s+/g, " ").trim();
const roomKey = (r) => `${normalizeSpace(r.name)}|||${normalizeSpace(r.address)}|||${r.positions}`;

function diffProvince(province, local, remote) {
  const localMap = new Map(local.map((r) => [roomKey(r), r]));
  const remoteMap = new Map(remote.map((r) => [roomKey(r), r]));

  const missing = [...remoteMap.keys()].filter((k) => !localMap.has(k)).map((k) => remoteMap.get(k));
  const extra = [...localMap.keys()].filter((k) => !remoteMap.has(k)).map((k) => localMap.get(k));
  return { province, missing, extra };
}

function reportSource(label, sourceUrl, diffs, unreachablePages) {
  say(`## ${label}`);
  say();
  say(`Source data: [${sourceUrl}](${sourceUrl})`);
  say();

  const drifted = diffs.filter((d) => d.missing.length || d.extra.length);
  if (!drifted.length) {
    say("In sync with ETECSA's site.");
  }
  for (const { province, missing, extra } of drifted) {
    say(`### ${province}`);
    if (missing.length) {
      say(`${missing.length} room(s) on ETECSA's site but missing here (app is behind):`);
      say("```");
      missing.forEach((r) => say(`+ ${r.name} — ${r.address || "(no address)"} — ${r.positions} positions`));
      say("```");
    }
    if (extra.length) {
      say(`${extra.length} room(s) here but not on ETECSA's site (removed or renamed upstream):`);
      say("```");
      extra.forEach((r) => say(`- ${r.name} — ${r.address || "(no address)"} — ${r.positions} positions`));
      say("```");
    }
    say();
  }

  if (unreachablePages.length) {
    say(`Could not fetch (skipped, not counted as drift): ${unreachablePages.join(", ")}`);
    say();
  }
}

async function checkOneSource(source) {
  let remoteJson;
  try {
    const res = await fetchWithTimeout(source.url, FETCH_TIMEOUT_MS);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    remoteJson = await res.json();
  } catch (err) {
    say(`## ${source.label}`);
    say();
    say(`Could not fetch this platform's bundled file (${source.url}): ${err.message}`);
    say();
    return { drift: false, fetchFailed: true };
  }

  const diffs = [];
  const unreachablePages = [];

  for (const entry of remoteJson) {
    const id = PROVINCE_IDS[entry.province];
    if (id === undefined) {
      console.log(`No known ETECSA province id for "${entry.province}" — skipping (update PROVINCE_IDS).`);
      unreachablePages.push(entry.province);
      continue;
    }

    let html;
    try {
      const res = await fetchWithTimeout(`${BASE_URL}?provincia=${id}`, FETCH_TIMEOUT_MS);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      html = await res.text();
    } catch (err) {
      console.log(`Failed to fetch ${entry.province} (provincia=${id}) for ${source.label}: ${err.message}`);
      unreachablePages.push(entry.province);
      await sleep(DELAY_BETWEEN_REQUESTS_MS);
      continue;
    }

    diffs.push(diffProvince(entry.province, entry.rooms, parseRooms(html)));
    await sleep(DELAY_BETWEEN_REQUESTS_MS);
  }

  const drift = diffs.some((d) => d.missing.length || d.extra.length);
  reportSource(source.label, source.url, diffs, unreachablePages);
  return { drift, fetchFailed: false };
}

async function main() {
  if (!(await checkReachable())) {
    console.log(
      "ETECSA's site is not reachable from this runner (likely geo-restricted or blocking this IP range " +
        "— GitHub-hosted runners run outside Cuba). Skipping all province checks rather than burning " +
        "Actions minutes retrying pages that will keep failing the same way."
    );
    process.exit(2);
  }

  say(`# WiFi navigation rooms sync check`);
  say();
  say(`Compares each platform's bundled directory against [ETECSA's own site](${BASE_URL}).`);
  say();

  let anyDrift = false;
  for (const source of SOURCES) {
    const { drift } = await checkOneSource(source);
    anyDrift = anyDrift || drift;
  }

  finish(anyDrift);
}

function finish(drift) {
  const out = lines.join("\n") + "\n";
  process.stdout.write(out);
  if (process.env.REPORT_FILE) fs.writeFileSync(process.env.REPORT_FILE, out);
  process.exit(drift ? 1 : 0);
}

main();
