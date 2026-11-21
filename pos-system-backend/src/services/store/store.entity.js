import { idOf } from '../middlewares';
import Store from './store.schema';
import User from '../user/user.schema';
import Sales from '../sales/sales.schema';
import Category from '../category/category.schema';
import Product from '../product/product.schema';
import History from '../history/history.schema';
import rearrageSearch from '../../utils/rearrageSearch';

const createAllowed = new Set(['name', 'address', 'phone', 'image', 'status', 'taxPercent', 'currency']);
const updatedAllowed = new Set(['name', 'address', 'phone', 'image', 'status', 'taxPercent', 'maxLogedIn', 'currency']);
const allowedQuery = new Set(['page', 'limit', 'id', '_id', 'paginate', 'users', 'search', 'status', 'sortBy']);

/**
 * Create a new Organization. only superadmin can create this Organization.
 *
 * @param {Object} req - The request object containing the properties for the new user.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} The created store object.
 */
export const create = ({ db, imageUp, lyra }) => async (req, res) => {
  try {
    req.body = JSON.parse(req.body.data || '{}');

    // check user provide valid properties
    const isValid = Object.keys(req.body).every(key => createAllowed.has(key));
    if (!isValid) return res.status(400).send('Bad Request');

    if (req.files?.image) req.body.image = await imageUp(req.files?.image);

    const store = await db.create({ table: Store, key: req.body });
    if (!store) return res.status(400).send('Bad Request');

    await db.create({ table: Category, key: { name: 'Other', store: store._id.toString() } });

    // insert product data for orama search
    await lyra.insert('store', {
      id: store._id.toString(),
      name: store.name,
    });

    return res.status(200).send(store);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message || 'Something went wrong');
  }
};

/**
 * @param {Object} req - The request object containing the properties for product.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} - get store information.
 */
export const get = ({ db }) => async (req, res) => {
  try {
    let store = await db.findOne({ table: Store, key: { populate: { path: 'owner logedInUser', select: 'fullName role image' }, id: req.user.role !== 'superadmin' ? req.user.store.toString() : req.params.id } });
    if (!store) return res.status(400).send('Store not found');
    res.status(200).send(store);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
};

/**
 * @param {Object} req - The request object containing the properties for product.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} - get all store information.
 */
export const getAll = ({ db, lyra }) => async (req, res) => {
  try {
    // implementing orama search
    if (req.query.search) {
      const data = await lyra.search('store', { term: req.query.search });
      const Ids = data.hits.map(elem => elem.id);
      req.query.id = { $in: Ids };
      req.query.page = 1;
      delete req.query.search;
    }

    let stores = await db.find({ table: Store, key: { allowedQuery, query: req.query, populate: { path: 'owner', select: 'fullName email' } } });

    // mongodb find method change the serial of lyra search data. apply sorting for lyra search and mongodb search serial same.
    if (req.query.id) {
      stores = await rearrageSearch(req.query, stores);
    }

    res.status(200).send(stores);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
};

/**
 * Update Organization. only superadmin can update this Organization.
 *
 * @param {Object} req - The request object containing the properties for the new user.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} The updated store object.
 */
export const update = ({ db, imageUp, lyra }) => async (req, res) => {
  try {
    if (req.user.role !== 'superadmin' && idOf(req.user.store) !== req.params.id) return res.status(403).send('Forbidden');
    req.body = JSON.parse(req.body.data || '{}');

    // check user provide valid properties
    const isValid = Object.keys(req.body).every(key => updatedAllowed.has(key));
    if (!isValid) return res.status(400).send('Bad Request');

    if (req.files?.image) req.body.image = await imageUp(req.files?.image);

    const store = await db.update({ table: Store, key: { id: req.params.id, body: req.body, populate: { path: 'owner logedInUser', select: 'fullName email' } } });
    if (!store) return res.status(400).send('Bad Request');

    // remove previously inserted search data
    await lyra.remove('store', req.params.id);

    // insert product data for orama search
    await lyra.insert('store', {
      id: store._id.toString(),
      name: store.name,
    });

    return res.status(200).send(store);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message || 'Something went wrong');
  }
};

/**
 * Delete Organization. only superadmin can Delete this Organization.
 *
 * @param {Object} req - The request object containing the properties for the new user.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} success or fail message.
 */
export const remove = ({ db, lyra }) => async (req, res) => {
  try {
    const store = await db.remove({ table: Store, key: { id: req.params.id } });
    if (!store) return res.status(404).send('Store not found');

    await db.removeAll({ table: User, key: { store: req.params.id } });
    await db.removeAll({ table: Sales, key: { store: req.params.id } });
    await db.removeAll({ table: History, key: { store: req.params.id } });
    await db.removeAll({ table: Product, key: { store: req.params.id } });
    await db.removeAll({ table: Category, key: { store: req.params.id } });

    await lyra.remove('store', req.params.id);
    res.status(200).send({ message: 'Deleted Successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
};

/**
 * @param {Object} req - The request object containing the properties for product.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} - reset all store user.
 */
export const resetStore = ({ db, ws }) => async (req, res) => {
  try {

    const store = await db.findOne({ table: Store, key: { id: req.params.id } });
    if (!store) return res.status(400).send('Bad Request');

    ws.to(req.params.id).emit('resetStore', 'Logout all users');
    res.status(200).send('Store Successfully Reset');

  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
};

