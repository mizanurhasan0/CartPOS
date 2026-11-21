// Seeds one superadmin, one admin and one user (plus a store) into the database in MONGODB_URL.
// Idempotent: users/stores that already exist (by email / store name) are skipped.
// Usage:  MONGODB_URL='mongodb+srv://USER:PASS@host/POS' node db/seed-users.cjs
const crypto = require('crypto');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const url = process.env.MONGODB_URL;
if (!url) { console.error('MONGODB_URL is required'); process.exit(1); }

const pw = () => 'Pos' + crypto.randomBytes(5).toString('base64url') + '#' + crypto.randomInt(10, 99);

async function nextCount(db, model, field, start) {
  const col = db.collection('identitycounters');
  const cur = await col.findOne({ model, field });
  if (!cur) { await col.insertOne({ model, field, count: start }); return start; }
  const r = await col.findOneAndUpdate({ model, field }, { $inc: { count: 1 } }, { returnDocument: 'after' });
  return (r.value ?? r).count;
}

(async () => {
  const client = await MongoClient.connect(url, { serverSelectionTimeoutMS: 15000 });
  const db = client.db();
  const now = new Date();
  const out = [];

  let store = await db.collection('stores').findOne({ name: 'Main Store' });
  if (!store) {
    const storeId = await nextCount(db, 'Store', 'storeId', 1000);
    const ins = await db.collection('stores').insertOne({
      name: 'Main Store', address: 'Dhaka', phone: '01000000000', status: 'active', users: [], logedInUser: [],
      taxPercent: 5, maxLogedIn: 5, currency: { name: 'BDT', symbol: 'Tk' }, storeId, createdAt: now, updatedAt: now,
    });
    store = { _id: ins.insertedId };
  }

  const roles = [
    { role: 'superadmin', email: 'superadmin@pos.local', fullName: 'Super Admin', store: null },
    { role: 'admin', email: 'admin@pos.local', fullName: 'Store Admin', store: store._id },
    { role: 'user', email: 'user@pos.local', fullName: 'Store User', store: store._id },
  ];

  for (const r of roles) {
    if (await db.collection('users').findOne({ email: r.email })) { out.push({ role: r.role, username: r.email, password: '(already exists, unchanged)' }); continue; }
    const password = pw();
    const userId = await nextCount(db, 'User', 'userId', 1);
    const setting = await db.collection('settings').insertOne({ stockOut: true });
    const ins = await db.collection('users').insertOne({
      fullName: r.fullName, email: r.email, password: await bcrypt.hash(password, 10), role: r.role, status: true,
      address: 'Head Office', userId, setting: setting.insertedId, createdAt: now, updatedAt: now,
      ...(r.store ? { store: r.store } : {}),
    });
    if (r.role === 'admin') await db.collection('stores').updateOne({ _id: store._id }, { $set: { owner: ins.insertedId }, $push: { users: ins.insertedId } });
    if (r.role === 'user') await db.collection('stores').updateOne({ _id: store._id }, { $push: { users: ins.insertedId } });
    out.push({ role: r.role, username: r.email, password });
  }
  console.log('database:', db.databaseName);
  console.log(JSON.stringify(out, null, 2));
  await client.close();
})().catch((e) => { console.error(e.message); process.exit(1); });
