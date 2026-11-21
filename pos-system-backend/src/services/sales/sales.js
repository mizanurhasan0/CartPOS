import { auth, checkRole } from '../middlewares';
import { create, get, getAll, refundSales } from './sales.entity';


export default function sales() {
  /**
  * POST /sales
  * @description This route is used to create a new sales.
  * @response {Object} 200 - the new sales object.
  */
  this.route.post('/sales', auth, checkRole(['admin', 'user']), create(this));

  /**
  * GET /sales/:id
  * @description This route is used to get a sales information by id.
  * @response {Object} 200 - sales object.
  */
  this.route.get('/sales/:id', auth, checkRole(['admin', 'user']), get(this));

  /**
  * GET /sales
  * @description This route is used to get a all sales.
  * @response {Object} 200 - sales object.
  */
  this.route.get('/sales', auth, checkRole(['superadmin', 'admin', 'user']), getAll(this));

  /**
  * PATCH /sales/refund
  * @description This route is used to refund sales.
  * @response {Object} 200 - sales object.
  */
  this.route.patch('/sales/refund', auth, checkRole(['admin']), refundSales(this));
}