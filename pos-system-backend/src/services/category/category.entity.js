import rearrageSearch from '../../utils/rearrageSearch';
import Category from './category.schema';

const allowedQuery = new Set(['page', 'limit', 'id', '_id', 'paginate', 'sortBy', 'store', 'search']);
/**
 * Create new category under a store
 *
 * @param {Object} req - The request object containing the properties of category.
 * @param {Object} db - The database object for interacting with the database.
 * @return {Object} - return the created category object.
 */
export const create = ({ db, lyra }) => async (req, res) => {
  try {
    // check user provide valid properties
    const isValid = Object.keys(req.body).every(key => new Set(['name', 'store', 'image']).has(key));
    if (!isValid) return res.status(400).send('Bad Request');

    const category = await db.create({ table: Category, key: req.body });
    if (!category) return res.status(400).send('Bad Request');

    // add product to lyra search
    await lyra.insert('category', { id: category._id.toString(), name: category.name });

    return res.status(200).send(category);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
};

/**
 * get all category from a store
 *
 * @param {Object} req - The request object containing the properties for the new user.
 * @param {Object} db - The database object for interacting with the database.
 * @return {Object} - The result object containing all category from a store.
 */
export const getAll = ({ db, lyra }) => async (req, res) => {
  try {
    // implementing orama search
    if (req.query.search) {
      const data = await lyra.search('category', { term: req.query.search });
      const Ids = data.hits.map(elem => elem.id);
      req.query.id = { $in: Ids };
      delete req.query.search;
    }

    let category = await db.find({ table: Category, key: { allowedQuery, paginate: req.query.paginate === 'true', query: { store: req.user.store, ...req.query } } });

    // mongodb find method change the serial of lyra search data. apply sorting for lyra search and mongodb search serial same.
    if (req.query.id) {
      category = await rearrageSearch(req.query, category);
    }

    res.status(200).send(category);
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong');
  }
};
