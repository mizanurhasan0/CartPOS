import { auth, checkRole } from '../middlewares';
import { storeSuperadminReport, storeAdminReport, storeAdminChartReport, storeSuperAdminChartReport } from './dashboard.entity';

export default function dashboard() {

  /**
  * GET /superadmin/reports
  * @description This route is used to get store dashboard report for superadmin.
  * @response {Object} 200 - sotre reports.
  */
  this.route.get('/superadmin/reports', auth, checkRole(['superadmin']), storeSuperadminReport(this));

  /**
  * GET /admin/reports
  * @description This route is used to get store dashboard report. admin and superadmin can view this reports.
  * @response {Object} 200 - sotre reports.
  */
  this.route.get('/admin/reports', auth, checkRole(['superadmin', 'admin']), storeAdminReport(this));

  /**
  * GET /admin/chart/reports
  * @description This route is used to get store dashboard report. admin and superadmin can view this reports.
  * @response {Object} 200 - sotre reports.
  */
  this.route.get('/admin/chart/reports', auth, checkRole(['superadmin', 'admin']), storeAdminChartReport(this));

  /**
  * GET /admin/chart/reports
  * @description This route is used to get store dashboard report. admin and superadmin can view this reports.
  * @response {Object} 200 - sotre reports.
  */
  this.route.get('/superadmin/chart/reports', auth, checkRole(['superadmin']), storeSuperAdminChartReport(this));
}
