import sharp from 'sharp';

async function generate() {
  try {
    // Read the SVG and render it to a 192x192 PNG
    await sharp('public/favicon.svg')
      .resize(192, 192)
      .png()
      .toFile('public/icon-192.png');
      
    // Also save it as WebP
    await sharp('public/favicon.svg')
      .resize(192, 192)
      .webp()
      .toFile('public/icon-192.webp');
      
    console.log('Successfully regenerated icon-192 assets from favicon.svg!');
  } catch (err) {
    console.error('Error generating icons:', err.message);
  }
}

generate();
