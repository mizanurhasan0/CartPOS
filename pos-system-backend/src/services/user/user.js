import { auth, checkRole } from '../middlewares';
import { get, getAll, login, logout, me, register, remove, updateOwn, updateUser, forgotPassword, verifyOtp, changePassword } from './user.entity';

export default function user() {

  /**
  * POST /user
  * @description This route is used to create a user.
  * @response {Object} 200 - the new user.
  */
  this.route.post('/user/register', auth, checkRole(['superadmin', 'admin']), register(this));

  /**
  * POST /user/login
  * @description this route is used to login a user.
  * @response {Object} 200 - the user.
  */
  this.route.post('/user/login', login(this));

  /**
  * GET /user/me
  * @description this route is used to get user profile.
  * @response {Object} 200 - the user.
  */
  this.route.get('/user/me', auth, me(this));

  /**
  * POST /user/logout
  * @description this route is used to logout a user.
  * @response 200 - success or fail message.
  */
  this.route.post('/user/logout', auth, logout(this));

  /**
  * PATCH ‘/user/me’
  * @description this route is used to update own profile.
  * @response {Object} 200 - the user.
  */
  this.route.patch('/user/me', auth, updateOwn(this));

  /**
  * PATCH ‘/user/:id’
  * @description this route is used to update user profile.
  * @response {Object} 200 - updated user.
  */
  this.route.patch('/user/:id', auth, checkRole(['superadmin', 'admin']), updateUser(this));

  /**
  * GET /user
  * @description this route is used to get all user.
  * @response {Object} 200 - the users.
  */
  this.route.get('/user', auth, checkRole(['superadmin', 'admin']), getAll(this));

  /**
  * GET /user/:id
  * @description this route is used to get user by id.
  * @response {Object} 200 - the users.
  */
  this.route.get('/user/:id', auth, checkRole(['superadmin', 'admin']), get(this));

  /**
  * DELETE ‘/user/:id’
  * @description this route is used to delete user profile.
  * @response {Object} 200 - success or fail message.
  */
  this.route.delete('/user/:id', auth, checkRole(['admin', 'superadmin']), remove(this));

  /**
  * POST /user/forgot/password
  * @description this route is used to send otp for forgoot password.
  * @response - encrypted token
  */
  this.route.post('/user/forgot/password', forgotPassword(this));

  /**
  * POST /user/otp/verify
  * @description this route is used to verify user otp.
  * @response - success or fail message
  */
  this.route.post('/user/otp/verify', verifyOtp(this));

  /**
  * POST /user/otp/verify
  * @description this route is used to verify user otp.
  * @response - success or fail message
  */
  this.route.post('/user/change/password', changePassword(this));

}
