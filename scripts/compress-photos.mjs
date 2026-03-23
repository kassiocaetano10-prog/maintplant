import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const PHOTOS_DIR = 'E:/PROJETO MANUTENÇÃO/fotos';
const OUTPUT_DIR = 'E:/PROJETO MANUTENÇÃO/PROEXEL/public/valves';

// Extract mappings from plantData: tag -> IMG filename
const plantDataPath = 'E:/PROJETO MANUTENÇÃO/PROEXEL/src/data/plantData.js';
const content = fs.readFileSync(plantDataPath, 'utf-8');

// Find VALVE_PHOTOS object
const photosMatch = content.match(/export const VALVE_PHOTOS\s*=\s*\{([^}]+)\}/s);
if (!photosMatch) {
  console.error('Could not find VALVE_PHOTOS in plantData.js');
  process.exit(1);
}

const entries = photosMatch[1].matchAll(/"([^"]+)"\s*:\s*"[^"]*\/([^"]+)"/g);
const mappings = [];
for (const m of entries) {
  mappings.push({ tag: m[1], imgName: m[2] });
}

console.log(`Found ${mappings.length} valve-photo mappings`);

// Find actual files in photos dir
const allFiles = fs.readdirSync(PHOTOS_DIR);

let processed = 0;
let errors = 0;

for (const { tag, imgName } of mappings) {
  // Find matching file (imgName has no extension)
  const match = allFiles.find(f => f.startsWith(imgName));
  if (!match) {
    console.error(`MISSING: ${imgName} for tag ${tag}`);
    errors++;
    continue;
  }

  const inputPath = path.join(PHOTOS_DIR, match);
  // Use tag as filename, replacing dots with underscores for safety
  const safeTag = tag.replace(/\./g, '_');
  const outputPath = path.join(OUTPUT_DIR, `${safeTag}.webp`);

  try {
    await sharp(inputPath)
      .resize(600, null, { withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(outputPath);
    processed++;
    if (processed % 20 === 0) console.log(`Processed ${processed}/${mappings.length}...`);
  } catch (err) {
    console.error(`ERROR processing ${match}: ${err.message}`);
    errors++;
  }
}

console.log(`\nDone! Processed: ${processed}, Errors: ${errors}`);

// Generate the new VALVE_PHOTOS mapping
const newMappings = mappings
  .map(({ tag }) => {
    const safeTag = tag.replace(/\./g, '_');
    return `  "${tag}":"/valves/${safeTag}.webp"`;
  })
  .join(',\n');

console.log('\n--- New VALVE_PHOTOS (copy to plantData.js) ---');
console.log(`export const VALVE_PHOTOS = {\n${newMappings}\n};`);

// Write mapping to a temp file for easy use
fs.writeFileSync(
  'E:/PROJETO MANUTENÇÃO/PROEXEL/scripts/new-valve-photos.txt',
  `export const VALVE_PHOTOS = {\n${newMappings}\n};`
);
console.log('\nMapping saved to scripts/new-valve-photos.txt');
