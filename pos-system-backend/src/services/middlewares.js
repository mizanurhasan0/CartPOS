import decodeAuthToken from '../utils/AuthToken';
import settings from '../config';

/**
 * This function is used for validating user role.
 * It is an express middleware.
 * It checks that the role of the user is allowed to proceed the request or not.
 * @param {Array} allowed The allowed roles.
 * @throws {Error} If the role is not allowed then it throws an error.
 */
export function checkRole(allowed) {
  return async (req, res, next) => {
    try {
      if (allowed.includes(req.user.role)) return next();
      else throw new Error('Unauthorized.');
    }
    catch (e) {
      res.status(403).send({ status: 403, reason: 'forbidden' });
    }
  };
}

/**
 * This function is used to authenticate request.
 * After authetication it inserts the user data to reqest object.
 */
export async function auth(req, res, next) {
  try {
    const token = req.cookies[settings.tokenKey] || (process.env.NODE_ENV === 'development' ? req.header('Authorization')?.replace('Bearer ', '') : null);
    if (!token) return res.status(401).send({ status: 401, reason: 'Unauthorized' });
    const user = await decodeAuthToken(token);
    if (!user || user.status === false) return res.status(401).send({ status: 401, reason: 'Unauthorized' });
    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    console.log(e);
    res.status(401).send({ status: 401, reason: 'Unauthorized' });
  }
}

/**
 * This function is the middleware of socketauth.
 */
export async function socketAuth(socket, next) {
  try {
    const token = (socket.handshake?.headers?.cookie || '')?.split(';')?.find(s => s.includes(`${settings.tokenKey}=`))?.replace(`${settings.tokenKey}=`, '')?.replace(/\s/g, '') || socket?.handshake?.headers?.[settings.tokenKey]?.replace('Bearer ', '');
    if (!token) throw new Error('unauthorized');
    const user = await decodeAuthToken(token);
    if (!user) throw new Error('unauthorized');
    socket.user = user;
    if (user.role !== 'superadmin') socket.join(user.store.toString());
    next();
  } catch (e) {
    console.log(e);
    next(new Error('unauthorized'));
  }
}


/** Returns an id string for an ObjectId, a populated document, or an id string. */
export const idOf = (v) => (v == null ? '' : String(v._id ?? v));
