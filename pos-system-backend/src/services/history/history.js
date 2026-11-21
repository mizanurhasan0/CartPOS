import { auth, checkRole } from '../middlewares';
import { generateChart, getAll, storeTransectionStat, addBill } from './history.entity';


export default function history() {

  /**
  * GET /history
  * @description This route is used to get a all history.
  * @response {Object} 200 - history object.
  */
  this.route.get('/history', auth, checkRole(['superadmin', 'admin']), getAll(this));

  /**
  * GET /history/:id
  * @description This route is used to get statistic data of a store.
  * @response {Object} 200 - statistic object.
  */

  this.route.get('/history/:id', auth, checkRole(['superadmin', 'admin']), storeTransectionStat(this));

  /**
   * GET /history-chart/:type/:id/:chartType
   * @description This route is used to get chart data of a store.
   * @response {Object} 200 - chart data object.
  */
  this.route.get('/history-chart/:type/:id/:chartType', auth, checkRole(['superadmin', 'admin']), generateChart(this));

  /**
  * POST / history
  * @description This route is used to create new Bill.
  * @response {Object} 200 - Bill object.
  */
  this.route.post('/custom-bill', auth, checkRole(['admin']), addBill(this));
}