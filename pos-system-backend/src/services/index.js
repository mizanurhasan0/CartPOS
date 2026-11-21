import demo from './demo/demo';
import user from './user/user';
import store from './store/store';
import product from './product/product';
import setting from './setting/setting';
import category from './category/category';
import file from './file/file';
import dashboard from './dashboard/dashboard';
import history from './history/history';
import sales from './sales/sales';

export const services = (app) => {
  app.configure(demo);
  app.configure(user);
  app.configure(setting);
  app.configure(store);
  app.configure(product);
  app.configure(category);
  app.configure(file);
  app.configure(dashboard);
  app.configure(history);
  app.configure(sales);
};
