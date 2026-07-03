import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const BACKUP_DIR = path.join(PUBLIC_DIR, '_originals');

const TARGET_WIDTH = 1200;

// Excluded files
const EXCLUDED_FILES = [
  'favicon.ico',
  'favicon.svg',
  'icon-192.png',
  'icon-192.webp',
  'robots.txt',
  'sitemap.xml',
  'llms.txt'
];

async function main() {
  console.log(`Starting image optimization process...`);
  
  if (!fs.existsSync(BACKUP_DIR)) {
    console.error(`Error: Backup directory ${BACKUP_DIR} does not exist. Safety step requires a pre-existing backup.`);
    process.exit(1);
  }

  const files = fs.readdirSync(PUBLIC_DIR);
  const imagesToProcess = [];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const isImage = ['.webp', '.jpg', '.jpeg', '.png'].includes(ext);
    const isExcluded = EXCLUDED_FILES.includes(file);
    
    const filePath = path.join(PUBLIC_DIR, file);
    if (fs.statSync(filePath).isDirectory() || isExcluded || !isImage) {
      continue;
    }
    
    imagesToProcess.push(file);
  }

  console.log(`Found ${imagesToProcess.length} images to optimize in public/.`);
  
  const report = [];

  for (const file of imagesToProcess) {
    const filePath = path.join(PUBLIC_DIR, file);
    const backupPath = path.join(BACKUP_DIR, file);
    
    // Safety check: ensure backup exists
    if (!fs.existsSync(backupPath)) {
      console.log(`Warning: Backup for ${file} not found in _originals/. Creating backup now...`);
      fs.copyFileSync(filePath, backupPath);
    }
    
    try {
      const metadata = await sharp(backupPath).metadata();
      const originalStats = fs.statSync(backupPath);
      const beforeKB = (originalStats.size / 1024).toFixed(2);
      
      const originalWidth = metadata.width;
      const originalHeight = metadata.height;
      
      if (!originalWidth) {
        report.push({
          file,
          status: 'Skipped',
          reason: 'Could not read width metadata',
          beforeWidth: '—',
          beforeHeight: '—',
          afterWidth: '—',
          afterHeight: '—',
          beforeKB,
          afterKB: beforeKB,
          reduction: '0.0%'
        });
        continue;
      }

      let afterWidth = originalWidth;
      let afterHeight = originalHeight;
      let resized = false;

      let pipeline = sharp(backupPath);

      if (originalWidth > TARGET_WIDTH) {
        afterWidth = TARGET_WIDTH;
        afterHeight = Math.round((originalHeight * TARGET_WIDTH) / originalWidth);
        pipeline = pipeline.resize({ width: TARGET_WIDTH });
        resized = true;
      }
      
      // Re-save as webp at quality 82 to the original path in public/
      await pipeline.webp({ quality: 82 }).toFile(filePath);
      
      const newStats = fs.statSync(filePath);
      const afterKB = (newStats.size / 1024).toFixed(2);
      const reduction = ((1 - newStats.size / originalStats.size) * 100).toFixed(1);
      
      report.push({
        file,
        status: 'Optimized',
        reason: resized ? `Resized to ${TARGET_WIDTH}px and compressed to WebP` : `Compressed in-place to WebP (original width <= ${TARGET_WIDTH}px)`,
        beforeWidth: originalWidth,
        beforeHeight: originalHeight,
        afterWidth,
        afterHeight,
        beforeKB,
        afterKB,
        reduction: `${reduction}%`
      });
      
      console.log(`Optimized: ${file} | ${originalWidth}x${originalHeight} (${beforeKB} KB) -> ${afterWidth}x${afterHeight} (${afterKB} KB) | Reduction: ${reduction}%`);
    } catch (err) {
      console.error(`Error processing ${file}:`, err.message);
      report.push({
        file,
        status: 'Error',
        reason: err.message,
        beforeWidth: '—',
        beforeHeight: '—',
        afterWidth: '—',
        afterHeight: '—',
        beforeKB: '—',
        afterKB: '—',
        reduction: '0.0%'
      });
    }
  }

  // Write final markdown report
  console.log('\n--- Final Image Optimization Report ---');
  let mdTable = `# Image Optimization Report\n\n`;
  mdTable += `| Filename | Status | Context / Details | Original Dimensions | Optimized Dimensions | Original Size | Optimized Size | Reduction |\n`;
  mdTable += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
  
  for (const item of report) {
    const origDim = item.beforeWidth !== '—' ? `${item.beforeWidth}x${item.beforeHeight}` : '—';
    const optDim = item.afterWidth !== '—' ? `${item.afterWidth}x${item.afterHeight}` : '—';
    mdTable += `| \`${item.file}\` | **${item.status}** | ${item.reason} | ${origDim} | ${optDim} | ${item.beforeKB} KB | ${item.afterKB} KB | ${item.reduction} |\n`;
  }
  
  fs.writeFileSync(path.join(PUBLIC_DIR, 'image-optimization-report.md'), mdTable);
  console.log(`Written report to public/image-optimization-report.md`);
}

main();
