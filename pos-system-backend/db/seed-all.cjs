// Fills every collection with realistic demo data: stores, users, settings, categories, products,
// sales (bills), and histories (sell / restock / expense / others) so Dashboard, Accounts, Bill,
// History, Refund and Inventory pages are all populated.
// Idempotent per store: a store that already has sales is left alone.
// Usage: MONGODB_URL='mongodb+srv://USER:PASS@host/POS' node db/seed-all.cjs   (run seed-users + seed-products first)
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
const url = process.env.MONGODB_URL;
if (!url) { console.error('MONGODB_URL is required'); process.exit(1); }

// deterministic PRNG so reruns/reviews are reproducible
let seed = 20261121;
const rnd = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const DAY = 86400000;

const DEMO_PASSWORD = 'Demo@1234';
const STORES = [
  { name: 'Main Store', address: 'Dhaka', phone: '01000000000', taxPercent: 5, key: 'main' },
  { name: 'Dhanmondi Branch', address: 'Road 27, Dhanmondi, Dhaka', phone: '01711000001', taxPercent: 5, key: 'dhanmondi' },
  { name: 'Chattogram Outlet', address: 'GEC Circle, Chattogram', phone: '01811000002', taxPercent: 7.5, key: 'ctg' },
];
const EXTRA_USERS = {
  main: [['Rafiq Ahmed', 'main.user2@pos.local'], ['Nusrat Jahan', 'main.user3@pos.local']],
  dhanmondi: [['Dhanmondi Admin', 'dhanmondi.admin@pos.local', 'admin'], ['Imran Hossain', 'dhanmondi.user1@pos.local'], ['Sadia Islam', 'dhanmondi.user2@pos.local']],
  ctg: [['Chattogram Admin', 'ctg.admin@pos.local', 'admin'], ['Tanvir Alam', 'ctg.user1@pos.local'], ['Farhana Akter', 'ctg.user2@pos.local']],
};
const CUSTOMERS = ['Rahim Uddin', 'Karim Hossain', 'Salma Khatun', 'Nasrin Akter', 'Jahid Hasan', 'Mim Chowdhury', 'Sohel Rana', 'Tania Sultana', 'Arif Mahmud', 'Rima Begum',
  'Shakil Ahmed', 'Mou Rahman', 'Habib Khan', 'Lima Akter', 'Fahim Reza', 'Shirin Sultana', 'Tuhin Mia', 'Nadia Islam', 'Anik Das', 'Walk-in Customer'];
const EXPENSES = [['Shop Rent', 8000], ['Electricity Bill', 1500], ['Internet Bill', 800], ['Staff Salary', 6000], ['Cleaning Supplies', 450], ['Packaging Material', 700],
  ['Transport / Delivery', 500], ['Marketing Flyers', 800], ['Equipment Repair', 1100], ['Water Bill', 250], ['Security Service', 1200]];
const OTHERS = [['Delivery Fee Income', 'revenue', 60], ['Return Packaging Refund', 'revenue', 150], ['Supplier Discount Received', 'revenue', 500]];
const INV = 'ABCDEMNEFG3HIF343JKLEFGHIMNE5476FMNEF54QRSTMGHIFGGHIOPQR89STMN8EFGHIFG9WXYZ';
const invoiceId = () => '#' + Array.from({ length: 10 }, () => INV[Math.floor(rnd() * INV.length)]).join('');
const phone = () => '01' + pick(['3', '5', '6', '7', '8', '9']) + String(ri(10000000, 99999999));
const dateAgo = (days) => { const d = new Date(Date.now() - days * DAY); d.setHours(ri(9, 21), ri(0, 59), ri(0, 59), 0); return d; };

(async () => {
  const client = await MongoClient.connect(url, { serverSelectionTimeoutMS: 20000 });
  const db = client.db();
  const C = (n) => db.collection(n);
  const counters = C('identitycounters');
  const reserve = async (model, field, n, start) => {
    const cur = await counters.findOne({ model, field });
    if (!cur) { await counters.insertOne({ model, field, count: start + n - 1 }); return start; }
    await counters.updateOne({ _id: cur._id }, { $set: { count: cur.count + n } });
    return cur.count + 1;
  };
  const summary = { stores: 0, users: 0, settings: 0, categories: 0, products: 0, sales: 0, histories: 0 };
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const now = new Date();

  // ---------- stores ----------
  const storeDocs = {};
  for (const s of STORES) {
    let doc = await C('stores').findOne({ name: s.name });
    if (!doc) {
      const [storeId] = [await reserve('Store', 'storeId', 1, 1000)];
      const r = await C('stores').insertOne({ name: s.name, address: s.address, phone: s.phone, status: 'active', users: [], logedInUser: [], taxPercent: s.taxPercent,
        maxLogedIn: 5, currency: { name: 'BDT', symbol: 'Tk' }, storeId, createdAt: new Date(Date.now() - 120 * DAY), updatedAt: now });
      doc = await C('stores').findOne({ _id: r.insertedId }); summary.stores++;
    }
    storeDocs[s.key] = doc;
  }

  // ---------- users + settings ----------
  const storeUsers = { main: [], dhanmondi: [], ctg: [] };
  const mkUser = async (store, key, fullName, email, role) => {
    let u = await C('users').findOne({ email });
    if (!u) {
      const userId = await reserve('User', 'userId', 1, 1);
      const setting = await C('settings').insertOne({ paymentNotify: rnd() > 0.5, stockOut: true, lowStock: rnd() > 0.4, systemUpdate: rnd() > 0.6, newUser: rnd() > 0.5, newItem: rnd() > 0.5 });
      const r = await C('users').insertOne({ fullName, email, password: hash, role, status: true, address: store.address, store: store._id, userId, setting: setting.insertedId,
        createdAt: new Date(Date.now() - ri(30, 110) * DAY), updatedAt: now });
      u = await C('users').findOne({ _id: r.insertedId });
      await C('stores').updateOne({ _id: store._id }, { $addToSet: { users: u._id }, ...(role === 'admin' ? {} : {}) });
      summary.users++; summary.settings++;
    }
    storeUsers[key].push(u);
    return u;
  };
  // existing seeded users belong to Main Store
  for (const email of ['admin@pos.local', 'user@pos.local']) { const u = await C('users').findOne({ email }); if (u) storeUsers.main.push(u); }
  for (const [key, list] of Object.entries(EXTRA_USERS)) {
    for (const [fullName, email, role = 'user'] of list) {
      const u = await mkUser(storeDocs[key], key, fullName, email, role);
      if (role === 'admin' && !storeDocs[key].owner) { await C('stores').updateOne({ _id: storeDocs[key]._id }, { $set: { owner: u._id } }); storeDocs[key].owner = u._id; }
    }
  }
  // fill missing settings for any user without one
  for (const u of await C('users').find({ setting: { $exists: false } }).toArray()) {
    const s = await C('settings').insertOne({ paymentNotify: false, stockOut: true, lowStock: false, systemUpdate: false, newUser: false, newItem: false });
    await C('users').updateOne({ _id: u._id }, { $set: { setting: s.insertedId } }); summary.settings++;
  }

  // ---------- categories + products for the other stores (clone Main Store catalog) ----------
  const main = storeDocs.main;
  const mainCats = await C('categories').find({ store: main._id }).toArray();
  const mainProds = await C('products').find({ store: main._id }).sort({ productId: 1 }).toArray();
  for (const key of ['dhanmondi', 'ctg']) {
    const st = storeDocs[key];
    const catMap = {};
    for (const c of mainCats) {
      let ex = await C('categories').findOne({ name: c.name, store: st._id });
      if (!ex) { const r = await C('categories').insertOne({ name: c.name, store: st._id, ...(c.image ? { image: c.image } : {}), createdAt: now, updatedAt: now }); ex = { _id: r.insertedId }; summary.categories++; }
      catMap[c._id.toString()] = ex._id;
    }
    const fresh = [];
    for (const p of mainProds) {
      if (await C('products').findOne({ productCode: p.productCode, store: st._id })) continue;
      const f = 1 + (rnd() - 0.5) * 0.1;
      const out = p.stock === 0 ? rnd() < 0.5 : rnd() < 0.06;
      fresh.push({ name: p.name, description: p.description, ...(p.image ? { image: p.image } : {}), category: catMap[p.category.toString()], store: st._id, productCode: p.productCode,
        buyingPrice: Math.round(p.buyingPrice * f), sellingPrice: Math.round(p.sellingPrice * f), stock: out ? 0 : ri(8, 160), restock: false, sold: 0, status: 'active', createdAt: now, updatedAt: now });
    }
    if (fresh.length) {
      const first = await reserve('Product', 'productId', fresh.length, 1000);
      fresh.forEach((p, i) => { p.productId = first + i; });
      await C('products').insertMany(fresh); summary.products += fresh.length;
    }
  }

  // ---------- sales + histories per store ----------
  for (const s of STORES) {
    const st = storeDocs[s.key];
    if (await C('sales').countDocuments({ store: st._id }) > 0) continue;
    const cashiers = storeUsers[s.key].length ? storeUsers[s.key] : [await C('users').findOne({ role: 'admin', store: st._id })];
    const products = await C('products').find({ store: st._id }).toArray();
    const state = new Map(products.map((p) => [p._id.toString(), { ...p, initial: p.stock }]));
    const histories = [];
    const sales = [];

    // sales across the last 75 days (more weight on recent days), guarantee some today / this week
    const n = s.key === 'main' ? 200 : 165;
    const days = Array.from({ length: n }, (_, i) => (i < 4 ? 0 : i < 12 ? ri(1, 6) : Math.floor(Math.pow(rnd(), 1.6) * 75)));
    days.sort((a, b) => b - a);
    for (const d of days) {
      const available = [...state.values()].filter((p) => p.stock > 0);
      if (!available.length) break;
      const lines = [];
      const count = ri(1, 5);
      const used = new Set();
      for (let i = 0; i < count; i++) {
        const p = pick(available); if (used.has(p._id.toString())) continue; used.add(p._id.toString());
        const quantity = Math.min(ri(1, 4), p.stock);
        const percentageDiscount = rnd() < 0.35;
        const discount = rnd() < 0.7 ? 0 : (percentageDiscount ? pick([5, 10]) : pick([2, 5]));
        lines.push({ p, quantity, percentageDiscount, discount });
      }
      const gross = lines.reduce((a, l) => a + l.quantity * l.p.sellingPrice, 0);
      const disc = lines.reduce((a, l) => a + (l.percentageDiscount ? l.p.sellingPrice * (l.discount / 100) * l.quantity : l.discount * l.quantity), 0);
      const totalTax = (gross - disc) * (st.taxPercent / 100);
      const flat = rnd() < 0.15 ? pick([10, 20, 50]) : 0;
      const when = dateAgo(d);
      const cashier = pick(cashiers);
      sales.push({
        customerName: pick(CUSTOMERS), customerPhone: phone(), cashier: cashier._id, store: st._id,
        products: lines.map((l) => ({ item: l.p._id, quantity: l.quantity, percentageDiscount: l.percentageDiscount, discount: l.discount })),
        subTotal: Math.round(gross - disc + totalTax - flat), totalTax, totalDiscount: disc, invoiceId: invoiceId(), flatDiscount: flat,
        paymentMethod: rnd() < 0.62 ? 'cash' : 'card', createdAt: when, updatedAt: when,
      });
      for (const l of lines) {
        const s0 = state.get(l.p._id.toString()); s0.stock -= l.quantity; s0.sold = (s0.sold || 0) + l.quantity;
        const base = l.percentageDiscount ? (l.p.sellingPrice - l.p.sellingPrice * (l.discount / 100)) * l.quantity : l.p.sellingPrice * l.quantity - l.discount;
        histories.push({ store: st._id, name: l.p.name, purpose: 'sell', cost: l.p.sellingPrice, quantity: l.quantity, type: 'revenue', total: base + base * (st.taxPercent / 100), createdAt: when, updatedAt: when });
      }
    }
    // a couple of refunds (the app records them as restock expenses)
    for (const sl of sales.filter((x) => x.products.length).slice(-6, -3)) {
      const it = sl.products[0]; const p = state.get(it.item.toString());
      histories.push({ store: st._id, name: 'Item refund', purpose: 'restock', cost: p.sellingPrice, quantity: 1, type: 'expense', total: p.sellingPrice, createdAt: new Date(sl.createdAt.getTime() + 3600000), updatedAt: now });
    }
    // initial purchase (restock) history per product, dated before the first sale
    for (const p of state.values()) {
      const total = (p.sold || 0) + ri(0, 6); // purchased what was sold plus a small buffer
      if (total <= 0) continue;
      const when = dateAgo(ri(78, 90));
      histories.push({ store: st._id, name: p.name, purpose: 'restock', cost: p.buyingPrice, quantity: total, type: 'expense', total: p.buyingPrice * total, createdAt: when, updatedAt: when });
    }
    // operating expenses (two months) + misc income
    for (let m = 0; m < 2; m++) for (const [name, cost] of EXPENSES.filter(() => rnd() < 0.6 || m === 0)) {
      const when = dateAgo(m * 30 + ri(0, 25)); const c = Math.round(cost * 0.5 * (0.9 + rnd() * 0.25));
      histories.push({ store: st._id, name, purpose: 'expense', cost: c, quantity: 1, type: 'expense', total: c, createdAt: when, updatedAt: when });
    }
    for (const [name, type, cost] of OTHERS) { const when = dateAgo(ri(0, 40)); const q = ri(1, 6); histories.push({ store: st._id, name, purpose: 'others', cost, quantity: q, type, total: cost * q, createdAt: when, updatedAt: when }); }

    // ids + inserts
    const sFirst = await reserve('Sales', 'salesId', sales.length, 1);
    sales.forEach((x, i) => { x.salesId = sFirst + i; });
    histories.sort((a, b) => a.createdAt - b.createdAt);
    const hFirst = await reserve('History', 'uid', histories.length, 1);
    histories.forEach((h, i) => { h.uid = hFirst + i; });
    if (sales.length) await C('sales').insertMany(sales);
    await C('histories').insertMany(histories);
    summary.sales += sales.length; summary.histories += histories.length;
    // persist stock/sold
    const ops = [...state.values()].map((p) => ({ updateOne: { filter: { _id: p._id }, update: { $set: { stock: p.stock, sold: p.sold || 0, updatedAt: now } } } }));
    await C('products').bulkWrite(ops);
  }

  const totals = {};
  for (const n of ['stores', 'users', 'settings', 'categories', 'products', 'sales', 'histories', 'identitycounters']) totals[n] = await C(n).countDocuments();
  console.log(JSON.stringify({ database: db.databaseName, added: summary, totals, newUsersPassword: DEMO_PASSWORD }, null, 2));
  await client.close();
})().catch((e) => { console.error(e); process.exit(1); });
