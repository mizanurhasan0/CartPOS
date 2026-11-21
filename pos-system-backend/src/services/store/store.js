import { auth, checkRole } from '../middlewares';
import { create, remove, update, get, getAll, resetStore } from './store.entity';

export default function store() {
  /**
  * POST /store
  * @description This route is used to create a new store. only super admin can create a store.
  * @response {Object} 200 - created new store object.
  */
  this.route.post('/store', auth, checkRole(['superadmin']), create(this));

  /**
  * GET /store/:id
  * @description This route is used to get store.
  * @response {Object} 200 - store object.
  */
  this.route.get('/store/:id', auth, checkRole(['superadmin', 'admin']), get(this));

  /**
  * GET /store
  * @description This route is used to get all store information.
  * @response {Object} 200 - store object.
  */
  this.route.get('/store', auth, checkRole(['superadmin', 'admin']), getAll(this));

  /**
  * PATCH /store/:id
  * @description This route is used to update store. only super admin can update store.
  * @response {Object} 200 - updated store object.
  */
  this.route.patch('/store/:id', auth, checkRole(['superadmin', 'admin']), update(this));

  /**
  * DELETE /store/:id
  * @description This route is used to delete store. only super admin can delete store.
  * @response {Object} 200 - success or fail message.
  */
  this.route.delete('/store/:id', auth, checkRole(['superadmin']), remove(this));
  /**
* GET /reset/store/:id
* @description This route is used to reset all store user.
* @response {Object} 200 - store object.
*/
  this.route.get('/reset/store/:id', auth, checkRole(['superadmin']), resetStore(this));


}