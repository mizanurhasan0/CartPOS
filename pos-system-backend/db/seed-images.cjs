// Attaches real photos (free-licensed, from Wikimedia Commons) to demo products and categories.
// Saves files into ./images and sets the `image` field in MongoDB. Credits are written to db/image-credits.json.
// Usage: MONGODB_URL='mongodb+srv://USER:PASS@host/POS' node db/seed-images.cjs   (run from pos-system-backend)
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { MongoClient } = require('mongodb');
const url = process.env.MONGODB_URL;
if (!url) { console.error('MONGODB_URL is required'); process.exit(1); }

const Q = {
  'Coca Cola 500ml': 'Coca-Cola bottle', 'Pepsi 500ml': 'Pepsi bottle', 'Sprite 500ml': 'Sprite bottle', 'Mango Juice 250ml': 'mango juice',
  'Orange Juice 1L': 'orange juice', 'Mineral Water 1L': 'bottled water', 'Energy Drink 250ml': 'energy drink can', 'Green Tea Pack': 'green tea',
  'Cold Coffee Can': 'iced coffee', 'Lemon Soda 330ml': 'lemon soda',
  'Potato Chips Classic': 'potato chips', 'Potato Chips Spicy': 'crisps snack', 'Salted Peanuts 200g': 'roasted peanuts', 'Chocolate Bar': 'chocolate bar',
  'Cream Biscuits': 'sandwich cookies', 'Chanachur 250g': 'bombay mix snack', 'Popcorn Butter': 'popcorn', 'Instant Noodles': 'instant noodles',
  'Cashew Nuts 100g': 'cashew nuts', 'Wafer Roll': 'wafer biscuit',
  'Fresh Milk 1L': 'milk bottle', 'Yogurt Cup 200g': 'yogurt', 'Butter 200g': 'butter', 'Cheese Slice Pack': 'cheese slices',
  'Condensed Milk Can': 'condensed milk', 'Ghee 500g': 'ghee', 'Powder Milk 500g': 'milk powder', 'Paneer 200g': 'paneer',
  'White Bread Loaf': 'white bread loaf', 'Brown Bread Loaf': 'whole wheat bread', 'Croissant': 'croissant', 'Chocolate Muffin': 'chocolate muffin',
  'Plain Cake Slice': 'cake slice', 'Burger Bun 4pcs': 'hamburger bun', 'Rusk Pack': 'rusk', 'Doughnut': 'doughnut',
  'Banana 1 dozen': 'bananas', 'Apple 1kg': 'red apples', 'Orange 1kg': 'oranges fruit', 'Potato 1kg': 'potatoes', 'Onion 1kg': 'onions',
  'Tomato 1kg': 'tomatoes', 'Carrot 500g': 'carrots', 'Cucumber 500g': 'cucumber', 'Green Chili 250g': 'green chili pepper',
  'Bath Soap': 'soap bar', 'Shampoo 180ml': 'shampoo bottle', 'Toothpaste 100g': 'toothpaste tube', 'Toothbrush': 'toothbrush',
  'Face Wash 100ml': 'face wash', 'Hand Sanitizer 100ml': 'hand sanitizer bottle', 'Body Lotion 200ml': 'lotion bottle', 'Deodorant Spray': 'deodorant spray', 'Razor Pack': 'razor',
  'Dishwashing Liquid 500ml': 'dishwashing liquid', 'Laundry Detergent 1kg': 'laundry detergent', 'Floor Cleaner 1L': 'floor cleaner bottle', 'Toilet Cleaner 500ml': 'toilet cleaner',
  'Tissue Box': 'tissue box', 'Garbage Bags 30pcs': 'garbage bags', 'Candle Pack': 'candles', 'Matchbox 10pcs': 'matchbox', 'Air Freshener': 'air freshener',
  'Ball Pen Blue': 'ballpoint pen', 'Notebook 100 pages': 'notebook', 'Pencil Pack 10pcs': 'pencils', 'Eraser': 'eraser', 'Marker Black': 'marker pen',
  'A4 Paper Ream': 'paper ream', 'Stapler': 'stapler', 'Sticky Notes': 'sticky notes',
  'Battery AA 4pcs': 'AA batteries', 'LED Bulb 9W': 'LED bulb', 'Phone Charger Cable': 'USB cable', 'Earphones': 'earphones', 'Umbrella': 'umbrella', 'Gift Wrap Roll': 'gift wrap',
};
const CATQ = { 'Beverages': 'soft drinks', 'Snacks': 'snack food', 'Dairy': 'dairy products', 'Bakery': 'bakery bread', 'Fruits & Vegetables': 'fruits and vegetables',
  'Personal Care': 'toiletries', 'Household': 'cleaning supplies', 'Stationery': 'stationery', 'Other': 'shopping bags' };

const UA = { 'User-Agent': 'pos-demo-seed/1.0 (demo image seeding script)' };
const BAD = /logo|diagram|map|icon|flag|chart|poster|stamp|coat of arms|screenshot|painting|drawing|sketch|\.svg|\.pdf|\.gif|\.tif/i;
const imagesDir = path.resolve('images');
const credits = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// fetch with polite retry/backoff for Wikimedia rate limits (429/503)
async function fx(u) {
  for (let i = 0; i < 3; i++) {
    let r; try { r = await fetch(u, { headers: UA, signal: AbortSignal.timeout(20000) }); } catch (e) { await sleep(2000); continue; }
    if (r.status === 429 || r.status === 503) { const ra = Number(r.headers.get('retry-after')) || 0; await sleep(Math.max(Math.min(ra, 10) * 1000, 3000 * (i + 1))); continue; }
    return r;
  }
  throw new Error('rate limited or timed out');
}

async function findImage(query) {
  const api = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({
    action: 'query', format: 'json', generator: 'search', gsrsearch: `${query} filetype:bitmap`, gsrnamespace: '6', gsrlimit: '12',
    prop: 'imageinfo', iiprop: 'url|mime|size|extmetadata', iiurlwidth: '400',
  });
  const res = await fx(api);
  if (!res.ok) throw new Error('search ' + res.status);
  const pages = Object.values((await res.json()).query?.pages || {}).sort((a, b) => a.index - b.index);
  const out = [];
  for (const p of pages) {
    const ii = p.imageinfo?.[0];
    if (!ii || ii.mime !== 'image/jpeg' || BAD.test(p.title) || !ii.thumburl) continue;
    if (ii.width < 400 || ii.height < 300 || ii.size > 4000000) continue;
    const ratio = ii.width / ii.height;
    if (ratio > 2.2 || ratio < 0.45) continue;
    out.push({ thumb: ii.thumburl, title: p.title, author: (ii.extmetadata?.Artist?.value || '').replace(/<[^>]+>/g, '').trim(), license: ii.extmetadata?.LicenseShortName?.value || '', page: ii.descriptionurl });
    if (out.length >= 4) break;
  }
  return out;
}
async function download(u) {
  const r = await fx(u);
  if (!r.ok) throw new Error('download ' + r.status);
  return Buffer.from(await r.arrayBuffer());
}
async function attach(col, doc, query) {
  const hits = await findImage(query);
  let hit = null, buf = null;
  for (const h of hits) { try { buf = await download(h.thumb); hit = h; break; } catch (e) { /* try next candidate */ } }
  if (!hit) return false;
  const file = crypto.randomBytes(16).toString('hex') + '.jpg';
  fs.writeFileSync(path.join(imagesDir, file), buf);
  await col.updateOne({ _id: doc._id }, { $set: { image: file } });
  credits.push({ for: doc.name, file, query, title: hit.title, author: hit.author, license: hit.license, source: hit.page });
  return true;
}

(async () => {
  if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);
  const client = await MongoClient.connect(url, { serverSelectionTimeoutMS: 15000 });
  const db = client.db();
  console.log('connected to', db.databaseName);
  const noImg = { $or: [{ image: { $exists: false } }, { image: null }, { image: '' }] };
  let ok = 0; const missed = [];
  for (const [colName, map, fallbackSuffix] of [['categories', CATQ, ''], ['products', Q, '']]) {
    const col = db.collection(colName);
    for (const doc of await col.find(noImg).toArray()) {
      const q = map[doc.name]; if (!q) continue; console.log('...  ' + colName + ': ' + doc.name);
      try { const done = await attach(col, doc, q); done ? ok++ : missed.push(doc.name); console.log((done ? 'ok   ' : 'none ') + colName + ': ' + doc.name); } catch (e) { missed.push(doc.name + ' (' + e.message + ')'); }
      await sleep(1500);
    }
  }
  fs.writeFileSync(path.join(__dirname, 'image-credits.json'), JSON.stringify(credits, null, 2));
  console.log(JSON.stringify({ attached: ok, missed }, null, 2));
  await client.close();
})().catch((e) => { console.error(e.message); process.exit(1); });
