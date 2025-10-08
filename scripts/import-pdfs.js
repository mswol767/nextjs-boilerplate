#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');

async function sanitizeName(name) {
  // replace spaces and bad chars
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

async function main() {
  const src = process.argv[2];
  if (!src) {
    console.error('Usage: node scripts/import-pdfs.js <source-folder> [--prefix now]');
    process.exit(2);
  }
  const prefix = process.argv[3] === '--prefix' ? Date.now() + '_' : '';
  const outDir = path.join(process.cwd(), 'public', 'members_files');
  try {
    await fs.mkdir(outDir, { recursive: true });
  } catch (err) {
    console.error('Failed to create output directory', err.message || err);
    process.exit(1);
  }

  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) await walk(full);
      else if (ent.isFile()) {
        const ext = path.extname(ent.name).toLowerCase();
        if (ext === '.pdf') {
          const safe = await sanitizeName(ent.name);
          const dest = path.join(outDir, prefix + safe);
          try {
            await fs.copyFile(full, dest);
            console.log('Copied', full, '->', dest);
          } catch (err) {
            console.error('Failed to copy', full, err.message || err);
          }
        }
      }
    }
  }

  try {
    await walk(src);
    console.log('Import complete. Files copied to', outDir);
  } catch (err) {
    console.error('Import failed', err.message || err);
    process.exit(1);
  }
}

main();
