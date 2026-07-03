import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const BACKUP_DIR = path.join(PUBLIC_DIR, '_originals');

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
  console.log(`Starting image resizing and optimization process...`);
  
  if (!fs.existsSync(BACKUP_DIR)) {
    console.error(`Error: Backup directory ${BACKUP_DIR} does not exist.`);
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
    
    try {
      const metadata = await sharp(backupPath).metadata();
      const originalStats = fs.statSync(backupPath);
      const beforeKB = (originalStats.size / 1024).toFixed(2);
      
      const originalWidth = metadata.width;
      const originalHeight = metadata.height;
      
      if (!originalWidth || !originalHeight) {
        report.push({
          file,
          status: 'Skipped',
          reason: 'Could not read metadata',
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

      // Determine target width
      // /aura-rgb-1.webp is the main homepage hero banner, largest size 640px -> target = 1280px
      // All other product cards/thumbnails/variants, largest display width is 380px -> target = 760px
      const isHero = file.startsWith('aura-rgb-1');
      const targetWidth = isHero ? 1280 : 760;
      const componentContext = isHero ? 'Hero.tsx (Hero Banner)' : 'ProductCard.tsx (Product Grid Card)';

      let afterWidth = originalWidth;
      let afterHeight = originalHeight;
      let resized = false;

      let pipeline = sharp(backupPath);

      if (originalWidth > targetWidth) {
        afterWidth = targetWidth;
        afterHeight = Math.round((originalHeight * targetWidth) / originalWidth);
        pipeline = pipeline.resize({ width: targetWidth });
        resized = true;
      }
      
      // Save as webp at quality 82
      await pipeline.webp({ quality: 82 }).toFile(filePath);
      
      const newStats = fs.statSync(filePath);
      const afterKB = (newStats.size / 1024).toFixed(2);
      const reduction = ((1 - newStats.size / originalStats.size) * 100).toFixed(1);
      
      report.push({
        file,
        status: resized ? 'Resized' : 'Compressed In-place',
        reason: resized 
          ? `Resized from ${originalWidth}px to ${targetWidth}px` 
          : `Skipped resize (already ${originalWidth}px <= ${targetWidth}px)`,
        context: componentContext,
        beforeWidth: originalWidth,
        beforeHeight: originalHeight,
        afterWidth,
        afterHeight,
        beforeKB,
        afterKB,
        reduction: `${reduction}%`
      });
      
      if (resized) {
        console.log(`Resized: ${file} | ${originalWidth}x${originalHeight} (${beforeKB} KB) -> ${afterWidth}x${afterHeight} (${afterKB} KB) | Reduction: ${reduction}%`);
      } else {
        console.log(`Compressed: ${file} | ${originalWidth}x${originalHeight} (${beforeKB} KB) -> ${afterWidth}x${afterHeight} (${afterKB} KB) | Reduction: ${reduction}%`);
      }
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

  // Print report
  console.log('\n--- Final Image Resizing & Optimization Report ---');
  let mdTable = `# Image Sizing & Optimization Report\n\n`;
  mdTable += `| Filename | Status | Context | Details | Original Dimensions | Optimized Dimensions | Original Size | Optimized Size | Reduction |\n`;
  mdTable += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
  
  for (const item of report) {
    const origDim = item.beforeWidth !== '—' ? `${item.beforeWidth}x${item.beforeHeight}` : '—';
    const optDim = item.afterWidth !== '—' ? `${item.afterWidth}x${item.afterHeight}` : '—';
    mdTable += `| \`${item.file}\` | **${item.status}** | ${item.context || '—'} | ${item.reason} | ${origDim} | ${optDim} | ${item.beforeKB} KB | ${item.afterKB} KB | ${item.reduction} |\n`;
  }
  
  fs.writeFileSync(path.join(PUBLIC_DIR, 'image-optimization-report.md'), mdTable);
  console.log(`Written report to public/image-optimization-report.md`);
}

main();
