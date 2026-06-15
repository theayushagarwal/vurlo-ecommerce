import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Load local env if available
const envPath = path.resolve('.env.local');
let config = {};
if (fs.existsSync(envPath)) {
  const envLocal = fs.readFileSync(envPath, 'utf-8');
  envLocal.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length === 2) {
      config[parts[0].trim()] = parts[1].trim();
    }
  });
}

// Retrieve from config or process.env
const apiKey = config.VITE_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY;
const authDomain = config.VITE_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId = config.VITE_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
const storageBucket = config.VITE_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = config.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const appId = config.VITE_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID;

if (!apiKey || !projectId) {
  console.error("Error: Missing Firebase environment variables. Cannot generate sitemap dynamically.");
  process.exit(1);
}

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function generate() {
  console.log("Fetching products from Firestore for dynamic sitemap generation...");
  const snap = await getDocs(collection(db, 'products'));
  const products = [];
  snap.forEach(doc => {
    const data = doc.data();
    if (data.active !== false && data.slug) {
      products.push(data.slug);
    }
  });

  console.log(`Found ${products.length} active products.`);

  const dateStr = new Date().toISOString().split('T')[0];

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- ══ CORE PAGES ══ -->
  <url>
    <loc>https://vurlo.store/</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://vurlo.store/shop</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://vurlo.store/contact</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://vurlo.store/privacy-policy</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://vurlo.store/terms-of-service</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://vurlo.store/refund-policy</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

  <!-- ══ PRODUCT PAGES ══ -->
${products.map(slug => {
  const priority = (slug === 'sunset-glow-projection-lamp' || slug === 'orbit-galaxy-projector') ? '0.9' : '0.8';
  return `  <url>
    <loc>https://vurlo.store/product/${slug}</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
}).join('\n')}

</urlset>
`;

  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }
  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xmlContent, 'utf-8');
  console.log(`Successfully wrote dynamic sitemap to: ${sitemapPath}`);
}

generate()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("Error generating sitemap:", err);
    process.exit(1);
  });
