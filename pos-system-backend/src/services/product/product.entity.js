import rearrageSearch from '../../utils/rearrageSearch';
import Category from '../category/category.schema';
import { createOneHistory } from '../history/history.function';
// import { createOneHistory } from '../history/history.function';
import Product from './product.schema';
const allowedQuery = new Set(['page', 'limit', 'id', '_id', 'paginate', 'populate', 'category', 'sortBy', 'store', 'search', 'stock', 'createdAt', 'status']);
const createAllowed = new Set(['name', 'description', 'image', 'category', 'store', 'productCode', 'buyingPrice', 'sellingPrice', 'tax', 'stock', 'sold', 'status']);
const updateAllowed = new Set(['name', 'description', 'image', 'category', 'store', 'productCode', 'buyingPrice', 'sellingPrice', 'tax', 'stock', 'sold', 'status']);

// add required query field
const QUERY = { status: 'active' };

/**
 * @param {Object} req - The request object containing the properties for product.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} new created product object.
 */
export const create = ({ db, imageUp, ws, lyra }) => async (req, res) => {
  try {
    req.body = JSON.parse(req.body.data || '{}');

    // check user provide valid properties
    const isValid = Object.keys(req.body).every(key => createAllowed.has(key));
    if (!isValid) return res.status(400).send('Bad Request');

    if (req.files?.image) req.body.image = await imageUp(req.files?.image);

    // check category image does not exist add product image also category image
    let category = await db.findOne({ table: Category, key: { id: req.body.category } });
    if (!category.image && req.body.image) {
      category.image = req.body.image;
      await db.save(category);
    }

    req.body.store = req.user.store.toString();

    // check product code is unique
    const prodCodeUnique = await db.findOne({ table: Product, key: { productCode: req.body.productCode, store: req.user.store.toString() } });
    if (prodCodeUnique) return res.status(400).send('Product Code must be unique');

    const product = await db.create({ table: Product, key: req.body });
    if (!product) return res.status(400).send('Bad Request');

    // restock product if user provide stock value gretter than 0
    if (product.stock > 0) {
      // add product into history
      const rawHistory = {
        name: product.name,
        purpose: 'restock',
        cost: product.buyingPrice,
        quantity: product.stock,
        type: 'expense',
        total: product.stock * product.buyingPrice,
        store: req.user.store.toString()
      };
      await createOneHistory(rawHistory, lyra, product.productCode);
    }

    // notify all user when add new item in a store
    ws.to(req.user.store.toString()).emit('newItem', { productId: product._id.toString(), createdAt: product.createdAt });

    // add product to lyra search
    await lyra.insert('product', { id: product._id.toString(), name: product.name, productCode: product.productCode });

    return res.status(200).send(product);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message || 'Something went wrong');
  }
};

/**
 * @param {Object} req - The request object containing the properties for product.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} - get a single product object.
 */
export const get = ({ db }) => async (req, res) => {
  try {
    const product = await db.findOne({ table: Product, key: { id: req.params.id, store: req.user.store, populate: { path: 'category store' } } });
    if (!product) return res.status(400).send('Product not found');
    res.status(200).send(product);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message || 'Something went wrong');
  }
};

/**
 * @param {Object} req - The request object containing the properties for product.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} - get all product object.
 */
export const getAll = ({ db, lyra }) => async (req, res) => {
  try {
    // implementing orama search
    if (req.query.search) {
      const data = await lyra.search('product', { term: req.query.search });
      const Ids = data.hits.map(elem => elem.id);
      req.query.id = { $in: Ids };
      req.query.page = 1;
      delete req.query.search;
    }

    const filter = req.query?.filter;
    delete req.query.filter;
    const filterConditions = {
      'all': { ...QUERY },
      'available': { ...QUERY, stock: { $gt: 0 } },
      'stockout': { ...QUERY, stock: { $lte: 0 } },
    };

    req.user.role !== 'superadmin' ? req.query.store = req.user.store.toString() : '';

    let product = await db.find({ table: Product, key: { allowedQuery, query: { ...QUERY, sortBy: 'stock:desc', ...req.query }, populate: { path: 'category store' }, ...filterConditions[filter] } });


    // mongodb find method change the serial of lyra search data. apply sorting for lyra search and mongodb search serial same.
    if (req.query.id) {
      product = await rearrageSearch(req.query, product);
    }

    // the cashier role must never receive the purchase (cost) price
    if (req.user.role === 'user' && Array.isArray(product?.docs)) {
      product.docs = product.docs.map((d) => { const o = typeof d.toJSON === 'function' ? d.toJSON() : { ...d }; delete o.buyingPrice; return o; });
    }
    res.status(200).send(product);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
};

/**
 * @param {Object} req - The request object containing the properties for product.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} - count product stock and total product.
 */
export const productCount = () => async (req, res) => {
  try {
    req.user.role !== 'superadmin' ? req.query.store = req.user.store.toString() : '';

    const availableProduct = await Product.countDocuments({ status: 'active', store: req.query.store, stock: { $gt: 0 } });
    const outofStock = await Product.countDocuments({ status: 'active', store: req.query.store, stock: { $lte: 0 } });

    return res.status(200).send({ availableProduct, outofStock });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
};

/**
 * @param {Object} req - The request object containing the properties for product.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} new created product object.
 */
export const update = ({ db, imageUp, lyra }) => async (req, res) => {
  try {
    req.body = JSON.parse(req.body.data || '{}');

    // check user provide valid properties
    const isValid = Object.keys(req.body).every(key => updateAllowed.has(key));
    if (!isValid) return res.status(400).send('Bad Request');

    if (req.files?.image) req.body.image = await imageUp(req.files?.image);

    const product = await db.update({ table: Product, key: { id: req.params.id, store: req.user.store, body: req.body } });
    if (!product) return res.status(400).send('Product not found');

    // remove previously inserted data and update new data
    await lyra.remove('product', req.params.id);
    await lyra.insert('product', { id: req.params.id, name: product.name, productCode: product.productCode });

    return res.status(200).send(product);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message || 'Something went wrong');
  }
};

/**
 * @param {Object} req - The request object containing the properties for product.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} updated product.
 */
export const productRestock = ({ db, lyra }) => async (req, res) => {
  try {

    // check user provide valid properties
    const isValid = Object.keys(req.body).every(key => new Set(['stock', 'buyingPrice', 'sellingPrice']).has(key));
    if (!isValid) return res.status(400).send('Bad Request');

    // check stock must be one or more number
    if (req.body.stock < 1) return res.status(400).send('Please provide more than one stock');
    // if admin update product stock set restock field true
    const product = await db.findOne({ table: Product, key: { id: req.params.id, store: req.user.store.toString() } });
    if (!product) return res.status(400).send('Product not found');

    product.stock = product.stock + req.body.stock;
    product.restock = true;
    product.buyingPrice = req.body.buyingPrice;
    product.sellingPrice = req.body.sellingPrice;

    await db.save(product);

    // add product into history
    const rawHistory = {
      name: product.name,
      purpose: 'restock',
      cost: product.buyingPrice,
      quantity: parseInt(req.body.stock),
      type: 'expense',
      total: parseInt(req.body.stock) * product.buyingPrice,
      store: req.user.store.toString()
    };
    await createOneHistory(rawHistory, lyra, product.productCode);

    return res.status(200).send(product);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
};

/**
 * @param {Object} req - The request object containing the properties for product.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} success or fail message.
 */
export const remove = ({ db, lyra }) => async (req, res) => {
  try {

    const product = await db.update({ table: Product, key: { id: req.params.id, store: req.user.store.toString(), body: { status: 'deactive' } } });
    if (!product) return res.status(404).send('Product not found');
    // remove product data from lyra
    await lyra.remove('product', req.params.id);
    res.status(200).send({ message: 'Deleted Successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
};
