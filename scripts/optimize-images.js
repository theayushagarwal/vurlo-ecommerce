import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

async function main() {
  console.log(`Scanning directory: ${PUBLIC_DIR}`);
  if (!fs.existsSync(PUBLIC_DIR)) {
    console.error('Public directory does not exist.');
    process.exit(1);
  }

  const files = fs.readdirSync(PUBLIC_DIR);
  const imageFiles = files.filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ext === '.jpg' || ext === '.jpeg' || ext === '.png';
  });

  console.log(`Found ${imageFiles.length} image files to convert.`);

  for (const file of imageFiles) {
    const inputPath = path.join(PUBLIC_DIR, file);
    const basename = path.basename(file, path.extname(file));
    const outputPath = path.join(PUBLIC_DIR, `${basename}.webp`);

    try {
      const inputStats = fs.statSync(inputPath);
      const beforeKB = (inputStats.size / 1024).toFixed(2);

      // Convert using sharp
      await sharp(inputPath)
        .webp({ quality: 82 })
        .toFile(outputPath);

      const outputStats = fs.statSync(outputPath);
      const afterKB = (outputStats.size / 1024).toFixed(2);
      const reduction = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);

      console.log(`Converted: ${file} -> ${basename}.webp | Before: ${beforeKB} KB | After: ${afterKB} KB | Reduction: ${reduction}%`);
    } catch (err) {
      console.error(`Error converting ${file}:`, err.message);
    }
  }

  console.log('Image optimization process complete.');
}

main();
