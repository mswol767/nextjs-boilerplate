const fs = require('fs');
const path = require('path');

const EVENTS_PATH = path.resolve(__dirname, '..', 'public', 'events.json');
const ARCHIVE_PATH = path.resolve(__dirname, '..', 'public', 'events-archive.json');

function readJSON(p) {
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (err) {
    console.error('Failed to parse', p, err.message);
    process.exitCode = 2;
    return null;
  }
}

function writeJSON(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
}

function isoToDate(s) {
  return new Date(s);
}

function main() {
  const events = readJSON(EVENTS_PATH);
  if (!events) {
    console.error('No events file found at', EVENTS_PATH);
    process.exit(1);
  }

  const now = Date.now();
  const cutoff = now - 30 * 24 * 60 * 60 * 1000; // 30 days ago

  const kept = [];
  const removed = [];

  for (const ev of events) {
    const start = isoToDate(ev.start).getTime();
    if (isNaN(start)) {
      console.warn('Skipping event with invalid date:', ev.id);
      kept.push(ev);
      continue;
    }
    if (start < cutoff) {
      removed.push(ev);
    } else {
      kept.push(ev);
    }
  }

  if (removed.length === 0) {
    console.log('No events older than 30 days were found. Nothing to do.');
    return;
  }

  // Write back the kept events
  writeJSON(EVENTS_PATH, kept);
  console.log(`Pruned ${removed.length} event(s) older than 30 days from ${EVENTS_PATH}`);

  // Append removed to archive (create or merge)
  let archive = readJSON(ARCHIVE_PATH) || [];
  archive = archive.concat(removed);
  writeJSON(ARCHIVE_PATH, archive);
  console.log(`Appended ${removed.length} event(s) to archive at ${ARCHIVE_PATH}`);
}

main();
