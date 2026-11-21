// Seeds demo categories and products for the store "Main Store" (idempotent).
// Usage: MONGODB_URL='mongodb+srv://USER:PASS@host/POS' node db/seed-products.cjs
const { MongoClient } = require('mongodb');
const url = process.env.MONGODB_URL;
if (!url) { console.error('MONGODB_URL is required'); process.exit(1); }

// [name, buyingPrice, sellingPrice, stock]
const CATALOG = {
  'Beverages': ['BEV', [
    ['Coca Cola 500ml', 30, 40, 120], ['Pepsi 500ml', 30, 40, 95], ['Sprite 500ml', 30, 40, 80], ['Mango Juice 250ml', 22, 30, 60],
    ['Orange Juice 1L', 85, 110, 35], ['Mineral Water 1L', 12, 20, 200], ['Energy Drink 250ml', 55, 80, 40], ['Green Tea Pack', 120, 160, 25],
    ['Cold Coffee Can', 60, 85, 0], ['Lemon Soda 330ml', 25, 35, 70]]],
  'Snacks': ['SNK', [
    ['Potato Chips Classic', 18, 30, 150], ['Potato Chips Spicy', 18, 30, 130], ['Salted Peanuts 200g', 45, 65, 60], ['Chocolate Bar', 35, 50, 90],
    ['Cream Biscuits', 20, 30, 110], ['Chanachur 250g', 40, 60, 75], ['Popcorn Butter', 28, 45, 45], ['Instant Noodles', 22, 35, 180],
    ['Cashew Nuts 100g', 120, 160, 18], ['Wafer Roll', 15, 25, 0]]],
  'Dairy': ['DRY', [
    ['Fresh Milk 1L', 80, 100, 50], ['Yogurt Cup 200g', 30, 45, 40], ['Butter 200g', 150, 190, 22], ['Cheese Slice Pack', 140, 180, 28],
    ['Condensed Milk Can', 95, 125, 30], ['Ghee 500g', 520, 640, 12], ['Powder Milk 500g', 380, 450, 20], ['Paneer 200g', 110, 150, 0]]],
  'Bakery': ['BKR', [
    ['White Bread Loaf', 40, 55, 35], ['Brown Bread Loaf', 50, 70, 25], ['Croissant', 35, 55, 20], ['Chocolate Muffin', 40, 65, 18],
    ['Plain Cake Slice', 45, 70, 15], ['Burger Bun 4pcs', 30, 45, 30], ['Rusk Pack', 35, 50, 55], ['Doughnut', 30, 50, 0]]],
  'Fruits & Vegetables': ['FNV', [
    ['Banana 1 dozen', 60, 80, 40], ['Apple 1kg', 220, 280, 30], ['Orange 1kg', 160, 210, 25], ['Potato 1kg', 35, 50, 100],
    ['Onion 1kg', 50, 70, 90], ['Tomato 1kg', 60, 90, 45], ['Carrot 500g', 40, 60, 35], ['Cucumber 500g', 30, 45, 0], ['Green Chili 250g', 25, 40, 50]]],
  'Personal Care': ['PRC', [
    ['Bath Soap', 35, 50, 120], ['Shampoo 180ml', 160, 210, 45], ['Toothpaste 100g', 70, 95, 80], ['Toothbrush', 25, 40, 100],
    ['Face Wash 100ml', 180, 240, 30], ['Hand Sanitizer 100ml', 60, 90, 60], ['Body Lotion 200ml', 220, 290, 22], ['Deodorant Spray', 250, 330, 15], ['Razor Pack', 90, 130, 0]]],
  'Household': ['HSH', [
    ['Dishwashing Liquid 500ml', 90, 125, 50], ['Laundry Detergent 1kg', 160, 210, 40], ['Floor Cleaner 1L', 140, 185, 28], ['Toilet Cleaner 500ml', 110, 150, 32],
    ['Tissue Box', 45, 70, 85], ['Garbage Bags 30pcs', 70, 100, 40], ['Candle Pack', 30, 50, 60], ['Matchbox 10pcs', 15, 25, 140], ['Air Freshener', 130, 180, 0]]],
  'Stationery': ['STN', [
    ['Ball Pen Blue', 8, 15, 300], ['Notebook 100 pages', 40, 60, 90], ['Pencil Pack 10pcs', 50, 75, 70], ['Eraser', 5, 10, 150],
    ['Marker Black', 25, 40, 55], ['A4 Paper Ream', 420, 520, 14], ['Stapler', 90, 130, 20], ['Sticky Notes', 35, 55, 0]]],
  'Other': ['OTH', [
    ['Battery AA 4pcs', 70, 100, 65], ['LED Bulb 9W', 90, 130, 40], ['Phone Charger Cable', 150, 220, 25], ['Earphones', 200, 320, 18],
    ['Umbrella', 250, 380, 10], ['Gift Wrap Roll', 30, 50, 0]]],
};

(async () => {
  const client = await MongoClient.connect(url, { serverSelectionTimeoutMS: 15000 });
  const db = client.db();
  const store = await db.collection('stores').findOne({ name: 'Main Store' });
  if (!store) throw new Error('Store "Main Store" not found - run seed-users.cjs first');
  const now = new Date();
  const cats = db.collection('categories'), prods = db.collection('products'), counters = db.collection('identitycounters');

  let newCats = 0, newProds = 0, skipped = 0;
  for (const [catName, [prefix, items]] of Object.entries(CATALOG)) {
    let cat = await cats.findOne({ name: catName, store: store._id });
    if (!cat) { const r = await cats.insertOne({ name: catName, store: store._id, createdAt: now, updatedAt: now }); cat = { _id: r.insertedId }; newCats++; }

    const fresh = [];
    for (let i = 0; i < items.length; i++) {
      const code = `${prefix}-${String(i + 1).padStart(3, '0')}`;
      if (await prods.findOne({ productCode: code, store: store._id })) { skipped++; continue; }
      const [name, buyingPrice, sellingPrice, stock] = items[i];
      fresh.push({ name, description: `${name} - ${catName}`, category: cat._id, store: store._id, productCode: code, buyingPrice, sellingPrice,
        stock, restock: false, sold: Math.floor(stock / 6), status: 'active', createdAt: now, updatedAt: now });
    }
    if (!fresh.length) continue;
    // reserve a block of productIds (counter semantics: first id = 1000)
    const cur = await counters.findOne({ model: 'Product', field: 'productId' });
    let first;
    if (!cur) { first = 1000; await counters.insertOne({ model: 'Product', field: 'productId', count: 1000 + fresh.length - 1 }); }
    else { first = cur.count + 1; await counters.updateOne({ _id: cur._id }, { $set: { count: cur.count + fresh.length } }); }
    fresh.forEach((p, i) => { p.productId = first + i; });
    await prods.insertMany(fresh);
    newProds += fresh.length;
  }
  console.log(JSON.stringify({ database: db.databaseName, categoriesAdded: newCats, productsAdded: newProds, skippedExisting: skipped,
    totals: { categories: await cats.countDocuments(), products: await prods.countDocuments(), outOfStock: await prods.countDocuments({ stock: 0 }) } }, null, 2));
  await client.close();
})().catch((e) => { console.error(e.message); process.exit(1); });
