import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const BACKUP_DIR = path.join(PUBLIC_DIR, '_originals');

const TARGET_WIDTH = 1280;

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
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`Created backup directory: ${BACKUP_DIR}`);
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

  console.log(`Found ${imagesToProcess.length} images to optimize.`);
  
  // Step 1: Backup all files first
  for (const file of imagesToProcess) {
    const sourcePath = path.join(PUBLIC_DIR, file);
    const backupPath = path.join(BACKUP_DIR, file);
    
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(sourcePath, backupPath);
      console.log(`Backed up: ${file} to _originals/`);
    }
  }

  console.log(`All backups completed successfully.`);
  
  // Step 2: Optimize and resize in-place
  const report = [];

  for (const file of imagesToProcess) {
    const filePath = path.join(PUBLIC_DIR, file);
    const backupPath = path.join(BACKUP_DIR, file);
    
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

      if (originalWidth <= TARGET_WIDTH) {
        report.push({
          file,
          status: 'Skipped',
          reason: `Width (${originalWidth}px) <= ${TARGET_WIDTH}px`,
          beforeWidth: originalWidth,
          beforeHeight: originalHeight,
          afterWidth: originalWidth,
          afterHeight: originalHeight,
          beforeKB,
          afterKB: beforeKB,
          reduction: '0.0%'
        });
        continue;
      }
      
      // Calculate new height maintaining aspect ratio
      const afterWidth = TARGET_WIDTH;
      const afterHeight = Math.round((originalHeight * TARGET_WIDTH) / originalWidth);

      // Perform resize and format compression
      const imagePipeline = sharp(backupPath).resize({ width: TARGET_WIDTH });
      
      // Save in WebP format
      await imagePipeline.webp({ quality: 82 }).toFile(filePath);
      
      const newStats = fs.statSync(filePath);
      const afterKB = (newStats.size / 1024).toFixed(2);
      const reduction = ((1 - newStats.size / originalStats.size) * 100).toFixed(1);
      
      report.push({
        file,
        status: 'Optimized',
        reason: `Resized and compressed`,
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

  // Print final markdown report
  console.log('\n--- Final Image Optimization Report ---');
  let mdTable = `| Filename | Status | Reason / Context | Original Dimensions | Optimized Dimensions | Original Size | Optimized Size | Reduction |\n`;
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
