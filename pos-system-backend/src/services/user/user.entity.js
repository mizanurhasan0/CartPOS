import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from './user.schema';
import Store from '../store/store.schema';
import Setting from '../setting/setting.schema';
import otpGenerate from '../../utils/otpGenerate';
import { decryptToken, encryptToken } from '../../utils/AuthToken';
import { sessionLength } from '../../utils/authSession';
import rearrageSearch from '../../utils/rearrageSearch';
import { idOf } from '../middlewares';

/**
 * these are the set to validate the request body or query.
 */
const createAllowed = new Set(['fullName', 'email', 'password', 'store', 'address', 'status']);
const allowedQuery = new Set(['page', 'limit', 'id', 'paginate', 'role', 'status', 'store', 'sortBy']);
// a user may edit only their own profile fields - never role, status or store
const ownUpdateAllowed = new Set(['fullName', 'email', 'password', 'image', 'address', 'passwordChange', 'data']);
// fields an admin/superadmin may change on another account (role is never editable)
const manageAllowed = new Set(['fullName', 'email', 'password', 'image', 'address', 'status', 'store']);

/**
 * Tenant + role rule for managing another account:
 * superadmin manages admins; an admin manages only plain users of their own store.
 */
const canManage = (actor, target) => {
  if (!target) return false;
  if (actor.role === 'superadmin') return target.role === 'admin';
  if (actor.role === 'admin') return target.role === 'user' && idOf(target.store) === idOf(actor.store);
  return false;
};

/**
 * Creates a new user in the database with the specified properties in the request body.
 * The 'role' property is automatically set to 'user', and the 'password' property is hashed using bcrypt.
 *
 * @param {Object} req - The request object containing the properties for the new user.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} The created user object, including the JWT token.
 * @throws {Error} If the request body includes properties other than those allowed or if there is an error during the database operation.
 */
export const register = ({ db, imageUp, ws, lyra }) => async (req, res) => {
  try {
    req.body = JSON.parse(req.body.data || '{}');

    const valid = Object.keys(req.body).every(k => createAllowed.has(k));
    if (!valid) return res.status(400).send('Bad request');

    if (req.files?.image) req.body.image = await imageUp(req.files?.image);

    // set user role
    req.body.password = await bcrypt.hash(req.body.password, 8);
    if (req.user.role === 'superadmin') req.body.role = 'admin';
    if (req.user.role === 'admin') req.body.role = 'user', req.body.store = req.user.store.toString();

    // check email is exist in database
    const checkEmail = await db.findOne({ table: User, key: { email: req.body.email } });
    if (checkEmail) return res.status(400).send('Email already exists.');
    // create user
    const user = await db.create({ table: User, key: { ...req.body, populate: { path: 'store' } } });
    if (!user) return res.status(400).send('Bad request');

    // create setting and link up with user
    const setting = await db.create({ table: Setting, key: { stockOut: true } });
    user.setting = setting._id;
    await db.save(user);

    // linkup store owner and user
    const store = await db.findOne({ table: Store, key: { id: req.body.store } });
    if (req.user.role === 'superadmin') store.owner = user._id;
    if (req.user.role === 'admin') store.users.push(user._id);

    await db.save(store);

    // when admin add new user in a store notify all existing user on this store
    if (req.user.role === 'admin') ws.to(req.user.store.toString()).emit('newUser', { userid: user._id.toString(), createdAt: user.createdAt });

    user.password = undefined;

    // insert user data into lyra search
    await lyra.insert('user', { id: user._id.toString(), name: user.fullName });

    return res.status(200).send(user);
  } catch (e) {
    console.log(e);
    res.status(500).send(e.message || 'Something went wrong.');
  }
};

/**
 * This function is used for login a user.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the data for success response. Otherwise it will through an error.
 */
export const login = ({ db, settings }) => async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) return res.status(400).send('Bad requests');
    const user = await db.findOne({ table: User, key: { email: req.body.email, populate: { path: 'setting store' } } });
    if (!user) return res.status(401).send('No user found with this email.');

    const isValid = await bcrypt.compare(req.body.password, user.password);
    if (!isValid) return res.status(401).send('Incorrect password.');
    if (!user.status) return res.status(401).send('Sorry, you cannot log in. Your account has been deactivated.');


    if (user?.role !== 'superadmin') {
      const store = await db.findOne({ table: Store, key: { id: user.store._id.toString() } });
      if (store.status === 'deactive') return res.status(401).send('Sorry, you cannot log in. Your store is currently deactivated.');

      const sessLen = sessionLength(store.id);
      // console.log('sessLen', sessLen);

      if (sessLen + 1 > store?.maxLogedIn) {
        return res.status(403).send('Maximum user login limit exceeded. Please try again later.');
      } else {
        const token = jwt.sign({ id: user.id }, settings.secret);
        res.cookie(settings.tokenKey, token, {
          httpOnly: true,
          ...settings.useHTTP2 && {
            sameSite: 'None',
            secure: true,
          },
          ...!req.body.rememberMe
          && { expires: new Date(Date.now() + 172800000/*2 days*/) },
        });

        return res.status(200).send(user);

      }
    }

    const token = jwt.sign({ id: user.id }, settings.secret);
    res.cookie(settings.tokenKey, token, {
      httpOnly: true,
      ...settings.useHTTP2 && {
        sameSite: 'None',
        secure: true,
      },
      ...!req.body.rememberMe && { expires: new Date(Date.now() + 172800000/*2 days*/) },
    });

    res.status(200).send(user);

  } catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
};

/**
 * This function is used for load a user profile from request header.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the data for success response. Otherwise it will through an error.
 */
export const me = ({ db }) => async (req, res) => {
  try {
    const user = await db.populate(req.user, { path: 'store setting' });

    if (user.role !== 'superadmin') {
      const store = await db.findOne({ table: Store, key: { id: user.store._id.toString() } });

      const sessLen = sessionLength(store.id);
      if (sessLen + 1 > store?.maxLogedIn) {
        // res.clearCookie(settings.tokenKey, {
        //   httpOnly: true,
        //   ...settings.useHTTP2 && {
        //     sameSite: 'None',
        //     secure: true,
        //   },
        //   expires: new Date(Date.now())
        // });
        return res.status(400).send('Maximum loggedin user limit exceeded');

      }
      else return res.status(200).send(user);
    }
    res.status(200).send(user);
  } catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
};

/**
 * This function is used for logout a user.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the data for success response. Otherwise it will through an error.
 */
export const logout = ({ settings }) => async (req, res) => {
  try {
    res.clearCookie(settings.tokenKey,
      {
      httpOnly: true,
      ...settings.useHTTP2 && {
        sameSite: 'None',
        secure: true,
      },
      expires: new Date(Date.now())
    });

    return res.status(200).send('Logout successful');
  } catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
};

/**
 * This function is used get all users in the database by query.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns a object, that contains resulted data and other information like page, limit.
 */
export const getAll = ({ db, lyra }) => async (req, res) => {
  try {

    // implementing orama search
    if (req.query.search) {
      const data = await lyra.search('user', { term: req.query.search });
      const Ids = data.hits.map(elem => elem.id);
      req.query.id = { $in: Ids };
      req.query.page = 1;
      delete req.query.search;
    }

    req.user.role === 'superadmin' ? req.query.role = 'admin' : req.query.role = 'user';
    req.user.role !== 'superadmin' ? req.query.store = req.user.store.toString() : '';

    let users = await db.find({ table: User, key: { allowedQuery, query: req.query, populate: { path: 'store' } } });

    // mongodb find method change the serial of lyra search data. apply sorting for lyra search and mongodb search serial same.
    if (req.query.id) {
      users = await rearrageSearch(req.query, users);
    }

    res.status(200).send(users);
  } catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
};


/**
 * This function is used get all users in the database by query.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns a object, that contains resulted data and other information like page, limit.
 */
export const get = ({ db }) => async (req, res) => {
  try {
    const users = await db.findOne({ table: User, key: { id: req.params.id, allowedQuery, populate: { path: 'store' } } });
    if (!canManage(req.user, users)) return res.status(403).send('Forbidden');
    res.status(200).send(users);
  } catch (err) {
    console.log(err);
    res.status(500).send('Something went wrong');
  }
};

const setPassword = async ({ oldPass, newPass, user }) => {
  if (!oldPass || !newPass) throw ({ status: 400, reason: 'bad request' });
  const isValid = await bcrypt.compare(oldPass, user.password);
  if (!isValid) throw ({ status: 401, reason: 'Invalid old Password' });
  return await bcrypt.hash(newPass, 8);
};

/**
 * This function is used to update user own profile.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the updated data.
 */
export const updateOwn = ({ db, imageUp, lyra }) => async (req, res) => {
  try {
    if (req.files?.image) {
      req.body = JSON.parse(req.body.data || '{}');
      req.body.image = await imageUp(req.files?.image);
    }
    const isValid = Object.keys(req.body).every(k => ownUpdateAllowed.has(k));
    if (!isValid) return res.status(400).send('Bad Request');
    if (req.body.passwordChange) {
      req.body.password = await setPassword({ oldPass: req.body.passwordChange.oldPass, newPass: req.body.passwordChange.newPass, user: req.user });
      delete req.body.passwordChange;
    }
    Object.keys(req.body).forEach(k => (req.user[k] = req.body[k]));
    const updatedUser = await db.save(req.user);

    // remove previously inserted data and update new data
    await lyra.remove('user', req.user.id.toString());
    await lyra.insert('user', { id: req.user.id.toString(), name: req.body.fullName });

    res.status(200).send(req.user);
  } catch (err) {
    console.log(err);
    res.status(err.status || 500).send(err.reason || 'Something went wrong');
  }
};

/**
 * This function is used update a user by admin and superadmin.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the updated data.
 */
export const updateUser = ({ db, imageUp, lyra }) => async (req, res) => {
  try {
    req.body = JSON.parse(req.body.data || '{}');
    if (req.files?.image) req.body.image = await imageUp(req.files?.image);

    const user = await db.findOne({ table: User, key: { id: req.params.id, populate: { path: 'store' } } });
    if (!user) return res.status(400).send('Bad request');
    if (!canManage(req.user, user)) return res.status(403).send('Forbidden');
    // whitelist fields (blocks role escalation); only a superadmin may move an account to another store
    if (!Object.keys(req.body).every(k => manageAllowed.has(k))) return res.status(400).send('Bad request');
    if (req.user.role !== 'superadmin') delete req.body.store;

    if (req.body.password) req.body.password = await bcrypt.hash(req.body.password, 8);
    Object.keys(req.body).forEach(k => (user[k] = req.body[k]));
    await db.save(user);

    // remove previously inserted data and update new data
    await lyra.remove('user', req.params.id);
    await lyra.insert('user', { id: user._id.toString(), name: user.fullName });

    await db.populate(user, { path: 'store' });

    res.status(200).send(user);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message || 'Something went wrong');
  }
};

/**
 * This function is used to delete user by superadmin.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the updated data.
 */
export const remove = ({ db, lyra }) => async (req, res) => {
  try {
    const target = await db.findOne({ table: User, key: { id: req.params.id } });
    if (!target) return res.status(404).send({ message: 'User not found' });
    if (!canManage(req.user, target)) return res.status(403).send({ message: 'Forbidden' });
    const user = await db.remove({ table: User, key: { id: req.params.id } });
    if (!user) return res.status(404).send({ message: 'User not found' });

    await lyra.remove('user', req.params.id);
    res.status(200).send({ message: 'Deleted Successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Something went wrong' });
  }
};

/**
 * This function is used to user forgot password.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the updated data.
 */
export const forgotPassword = ({ db, mail }) => async (req, res) => {
  try {
    if (req.body.email === (undefined || null || '')) return res.status(400).send('Please Provide valid email address');
    const user = await db.findOne({ table: User, key: { email: req.body.email } });
    if (!user) return res.status(404).send('User Not Found');

    const otp = otpGenerate();
    const token = await encryptToken({ otp, expireTime: Date.now() + 1000 * 60 * 5 });

    mail({ receiver: user.email, subject: 'Reset Passwords', body: `Your Reset Password Code : ${otp}`, type: 'text' });
    res.status(200).send(token);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Something went wrong' });
  }
};

/**
 * This function is used to verify user password.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the updated data.
 */
export const verifyOtp = () => async (req, res) => {
  try {
    const { otp, expireTime } = decryptToken(req.body.token);

    if (Date.now() > expireTime) return res.status(400).send({ status: false, messae: 'OTP code is expired' });
    if (!(otp === req.body.otp)) return res.status(400).send({ status: false, messae: 'Invalid OTP code' });

    res.status(200).send({ status: true, message: 'Verified', token: req.body.token });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Something went wrong' });
  }
};

/**
 * This function is used to change user password.
 * @param {Object} req This is the request object.
 * @param {Object} res This is the response object
 * @returns It returns Success or failed message.
 */
export const changePassword = ({ db }) => async (req, res) => {
  try {
    const data = decryptToken(req.body.token);

    if (data?.otpUsed) return res.status(400).send('Bad Request');
    if (req.body.password !== req.body.confirmPassword) return res.status(400).send('Password Does Not Match');

    const user = await db.findOne({ table: User, key: { email: req.body.email } });
    if (!user) return res.status(404).send('User Not Found');

    user.password = await bcrypt.hash(req.body.password, 8);
    await db.save(user);

    const token = await encryptToken({ ...data, otpUsed: true });
    res.status(200).send({ token, message: 'Password Successfully Updated' });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Something went wrong' });
  }
};
