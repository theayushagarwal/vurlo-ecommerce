import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = './public';

async function inspect() {
  const files = fs.readdirSync(publicDir);
  const results = [];
  
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (['.webp', '.jpg', '.jpeg', '.png'].includes(ext)) {
      const filePath = path.join(publicDir, file);
      try {
        const metadata = await sharp(filePath).metadata();
        const stat = fs.statSync(filePath);
        results.push({
          file,
          width: metadata.width,
          height: metadata.height,
          sizeKb: (stat.size / 1024).toFixed(2),
        });
      } catch (err) {
        console.error(`Error reading ${file}:`, err.message);
      }
    }
  }
  
  console.log(JSON.stringify(results, null, 2));
}

inspect();
