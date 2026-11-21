import User from '../../services/user/user.schema';
import Store from '../../services/store/store.schema';
import Category from '../../services/category/category.schema';
import Product from '../../services/product/product.schema';
import Sales from '../../services/sales/sales.schema';
import History from '../../services/history/history.schema';

/**
 * Rebuilds every Orama index from the MongoDB collections.
 * The documents use exactly the same shape the services insert while running,
 * so search results stay the same after a restart.
 *
 * @param {Object} lyra - SearchCtrl instance
 * @returns {Promise<Object>} - number of documents indexed per key
 */
export default async function reindexSearch(lyra) {
  const str = (v) => (v === undefined || v === null ? '' : String(v));
  const sources = {
    user: { model: User, map: u => ({ id: str(u._id), name: str(u.fullName) }) },
    store: { model: Store, map: s => ({ id: str(s._id), name: str(s.name) }) },
    category: { model: Category, map: c => ({ id: str(c._id), name: str(c.name) }) },
    product: { model: Product, map: p => ({ id: str(p._id), name: str(p.name), productCode: str(p.productCode) }) },
    sales: {
      model: Sales,
      populate: 'cashier',
      map: s => ({
        id: str(s._id),
        invoiceId: str(s.invoiceId).replace('#', ''),
        customerName: str(s.customerName),
        cashierName: str(s.cashier?.fullName),
      }),
    },
    history: { model: History, map: h => ({ id: str(h._id), name: str(h.name) }) },
  };

  const counts = {};
  for (const [key, { model, map, populate }] of Object.entries(sources)) {
    const query = model.find({}).lean();
    const rows = await (populate ? query.populate(populate, 'fullName') : query);
    counts[key] = 0;
    for (const row of rows) {
      try {
        await lyra.insert(key, map(row));
        counts[key] += 1;
      }
      catch (e) {
        console.error(`reindex ${key} failed for ${row._id}:`, e.message);
      }
    }
  }
  console.log('=> Search index rebuilt', counts);
  return counts;
}
