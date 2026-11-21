
import User from '../user/user.schema';
import { idOf } from '../middlewares';
import Setting from './setting.schema';
const updatedAllowed = new Set(['paymentNotify', 'stockOut', 'lowStock', 'systemUpdate']);
/**
 * Update user Setting.
 * @param {Object} req - The request object containing the properties for the new user.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} The updated store object.
 */
export const update = ({ db }) => async (req, res) => {
  try {


    // check user provide valid properties
    const isValid = Object.keys(req.body).every(key => updatedAllowed.has(key));
    if (!isValid) return res.status(400).send('Bad Request');
    const setting = await db.findOne({ table: Setting, key: { id: req.user?.setting.toString() } });
    if (!setting) return res.status(403).send('Forbidden');
    Object.keys(req.body).forEach(key => setting[key] = req.body[key]);
    await db.save(setting);
    return res.status(200).send(setting);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
};

/**
 * Get user Setting.
 * @param {Object} req - .
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} The store setttings data.
 */
export const getSettings = ({ db }) => async (req, res) => {
  try {
    const setting = await db.findOne({ table: Setting, key: { id: req.user.setting.toString() } });
    if (!setting) return res.status(400).send('Bad Request');
    return res.status(200).send(setting);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
};

/**
 * Get user Setting.
 * @param {Object} req - .
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} The store setttings data.
 */
export const loggedUser = ({ db }) => async (req, res) => {
  try {
    // admins may only see their own store's sessions
    if (req.user.role !== 'superadmin' && idOf(req.user.store) !== req.params.id) return res.status(403).send('Forbidden');
    const checkID = global.session[req.params.id];
    if (!checkID) return res.status(200).send([]);

    const logedUser = await Promise.all(global.session[req.params.id].map((id) => db.findOne({ table: User, key: { id } })));

    res.set('Cache-Control', 'no-store');
    return res.status(200).send(logedUser);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
};
