// Verifies that every #navlinks anchor points to a section that exists,
// and that every section.phase has a corresponding nav link.
// Catches drift when a section id is renamed/added/removed without
// updating the nav (or vice versa).
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'a320-pilota-reale.html');
const html = fs.readFileSync(htmlPath, 'utf8');

function extractIds(regex) {
  const ids = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    ids.push(match[1]);
  }
  return ids;
}

const navMatch = html.match(/<div class="phase-nav-inner"[^>]*>([\s\S]*?)<\/div>/);
if (!navMatch) {
  console.error('FAIL: could not find #navlinks block in HTML');
  process.exit(1);
}
const navHtml = navMatch[1];
const navHrefs = extractIds(/href="#([\w-]+)"/g);

const sectionIds = extractIds(/<section class="phase" id="([\w-]+)"/g);

const navSet = new Set(navHrefs);
const sectionSet = new Set(sectionIds);

const errors = [];

if (navHrefs.length !== navSet.size) {
  const seen = new Set();
  const dupes = navHrefs.filter(id => (seen.has(id) ? true : (seen.add(id), false)));
  errors.push(`Duplicate nav hrefs: ${[...new Set(dupes)].join(', ')}`);
}

if (sectionIds.length !== sectionSet.size) {
  const seen = new Set();
  const dupes = sectionIds.filter(id => (seen.has(id) ? true : (seen.add(id), false)));
  errors.push(`Duplicate section ids: ${[...new Set(dupes)].join(', ')}`);
}

for (const href of navHrefs) {
  if (!sectionSet.has(href)) {
    errors.push(`Nav link "#${href}" has no matching <section id="${href}">`);
  }
}

for (const id of sectionIds) {
  if (!navSet.has(id)) {
    errors.push(`Section "#${id}" has no matching nav link`);
  }
}

if (errors.length > 0) {
  console.error(`FAIL: nav/section id mismatch (${errors.length} issue(s))`);
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
}

console.log(`OK: ${navHrefs.length} nav links match ${sectionIds.length} sections 1:1`);
