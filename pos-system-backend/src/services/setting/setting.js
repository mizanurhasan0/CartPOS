import { auth, checkRole } from '../middlewares';
import { getSettings, update, loggedUser } from './setting.entity';

export default function setting() {

  /**
  * PATCH /settings
  * @description This route is used to update setting.
  * @response {Object} 200 - updated store object.
  */
  this.route.patch('/settings', auth, update(this));

  /**
  * GET /setting/
  * @description This route is used to update setting.
  * @response {Object} 200 - updated store object.
  */
  this.route.get('/settings', auth, getSettings(this));

  /**
  * GET /setting/logged-users
  * @description This route is used to update setting.
  * @response {Object} 200 - updated store object.
  */
  this.route.get('/setting/logged-users/:id', auth, checkRole(['superadmin', 'admin']), loggedUser(this));

}