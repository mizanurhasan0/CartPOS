import { auth, checkRole } from '../middlewares';
import { create, update, remove, productRestock, get, getAll, productCount } from './product.entity';


export default function product() {

  /**
  * POST /product
  * @description This route is used to create a new product.
  * @response {Object} 200 - the new product.
  */
  this.route.post('/product', auth, checkRole(['admin']), create(this));

  /**
  * GET /product/:id
  * @description This route is used to get a single product information by id.
  * @response {Object} 200 - product object.
  */
  this.route.get('/product/:id', auth, get(this));

  /**
  * GET /product
  * @description This route is used to get a all product.
  * @response {Object} 200 - product object.
  */
  this.route.get('/product', auth, checkRole(['superadmin', 'admin', 'user']), getAll(this));

  /**
  * GET /product-count
  * @description This route is used to get a all product.
  * @response {Object} 200 - product object.
  */
  this.route.get('/product-count', auth, checkRole(['superadmin', 'admin', 'user']), productCount(this));

  /**
  * PATCH /product/:id
  * @description This route is used to update product.
  * @response {Object} 200 - updated product.
  */
  this.route.patch('/product/:id', auth, checkRole(['admin']), update(this));

  /**
  * PATCH /product/restock/:id
  * @description This route is used to restock product.
  * @response {Object} 200 - updated product.
  */
  this.route.patch('/product/restock/:id', auth, checkRole(['admin']), productRestock(this));

  /**
  * DELETE /product/:id
  * @description This route is used to delete product.
  * @response {Object} 200 - success message.
  */
  this.route.delete('/product/:id', auth, checkRole(['admin']), remove(this));

}