import mongoose from 'mongoose';
import Product from '../product/product.schema';
import Store from '../store/store.schema';
import User from '../user/user.schema';
import Sales from '../sales/sales.schema';
const ObjectId = mongoose.Types.ObjectId;
const allowedQuery = new Set(['store', 'createdAt', 'type', 'timezone']);

// add required query field
const QUERY = { status: 'active' };

/**
 * Get Dashboard Store Report.
 * @param {Object} req - The request object containing the properties for the new user.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} The updated store object.
 */
export const storeSuperadminReport = () => async (req, res) => {
  const isValid = Object.keys(req.query).every(e => allowedQuery.has(e));
  if (!isValid) return res.status(400).send('Bad Request');
  try {
    const totalStore = await Store.countDocuments({});
    const activeStore = await Store.countDocuments({ status: 'active' });
    const totalUser = await User.countDocuments({});
    const revenue = await Sales.aggregate([
      { $unwind: '$products' },
      { $lookup: { from: 'products', localField: 'products.item', foreignField: '_id', as: 'productData' } },
      { $unwind: '$productData' },
      { $project: { _id: 0, product: '$productData', sellingPrice: '$productData.sellingPrice', buyingPrice: '$productData.buyingPrice' } },
      { $addFields: { revenue: { $subtract: ['$sellingPrice', '$buyingPrice'] } } },
      { $group: { _id: null, revenue: { $sum: '$revenue' } } }
    ]);
    const totalRevenue = revenue.length > 0 ? revenue[0].revenue : 0;
    const topSellingStore = await Sales.aggregate([
      { $group: { _id: '$store', totalAmount: { $sum: '$subTotal' } } },
      { $lookup: { from: 'stores', localField: '_id', foreignField: '_id', as: 'storeInfo' } },
      { $unwind: '$storeInfo' },
      { $sort: { totalAmount: -1 } },
      { $limit: 5 },
      { $project: { storeName: '$storeInfo.name', totalAmount: 1 } }
    ]);
    return res.send({ totalStore, activeStore, totalUser, totalRevenue, topSellingStore });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};
/**
 * Get Dashboard Store Report.
 * @param {Object} req - The request object containing the properties for the new user.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} The updated store object.
 */
export const storeAdminReport = () => async (req, res) => {
  const isValid = Object.keys(req.query).every(e => allowedQuery.has(e));
  if (!isValid) return res.status(400).send('Bad Request');
  try {
    const match = {};
    if (req.user.role === 'superadmin' && !req.query.store) return res.status(400).send('Store id is required');
    req.user.role !== 'superadmin' ? match.store = new ObjectId(req.user.store) : match.store = new ObjectId(req.query.store);

    const topSellingProducts = await topProducts({ ...match });
    const restockProducts = await Product.countDocuments({ ...QUERY, ...match, restock: true });
    const stockOutProducts = await Product.countDocuments({ ...QUERY, ...match, stock: { $lte: 0 } });
    const totalItems = await Product.countDocuments({ ...QUERY, ...match });

    // get today start and end dates
    let date = new Date();
    // date.setUTCHours(0);
    // date.setUTCMinutes(0);
    // date.setUTCSeconds(0);
    // console.log('today ', date);

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    match.createdAt = { $gte: startOfDay, $lte: endOfDay };

    // console.log(match);

    // get daily sales and cost report
    let sales = await getSales(match);
    let cost = await getCost(match);

    const dailyReport = { dailySales: sales.totalSales, dailyProfit: sales.totalSales - cost.totalCost, totalCost: cost.totalCost };

    const startOfYear = new Date(date);
    startOfYear.setMonth(0, 1);
    startOfYear.setHours(0, 0, 0, 0);
    const endOfYear = new Date(date);
    endOfYear.setMonth(11, 31);
    endOfYear.setHours(23, 59, 59, 999);
    match.createdAt = { $gte: startOfYear, $lte: endOfYear };

    // get yearly sales and cost report
    sales = await getSales(match);
    cost = await getCost(match);
    return res.status(200).send({
      stockOutProducts,
      restockProducts,
      totalItems,
      ...dailyReport,
      yearlySales: sales.totalSales,
      yearlyProfit: sales.totalSales - cost.totalCost,
      topSellingProducts
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};

/**
 * Get Dashboard Store Report.
 * @param {Object} req - The request object containing the properties for the new user.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} The updated store object.
 */
export const storeAdminChartReport = ({ db }) => async (req, res) => {
  const isValid = Object.keys(req.query).every(e => allowedQuery.has(e));
  if (!isValid || !req.query.timezone) return res.status(400).send('Bad Request');

  try {
    const match = {};
    if (req.user.role === 'superadmin' && !req.query.store) return res.status(400).send('Store id is required');
    req.user.role !== 'superadmin' ? match.store = new ObjectId(req.user.store.toString()) : match.store = new ObjectId(req.query.store);

    const pipeline = [];
    const date = new Date();

    // generate query for day
    if (req.query.type === 'day') {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      match.createdAt = { $gte: startOfDay, $lte: endOfDay };

      pipeline.push({ $match: match });
      pipeline.push({ $group: { _id: { hour: { $hour: { date: '$createdAt', timezone: req.query.timezone } } }, count: { $sum: 1 } } });
      pipeline.push({ $project: { _id: 0, hour: '$_id.hour', count: '$count' } });
      pipeline.push({ $sort: { 'hour': 1 } });

      const result = await db.aggr({ table: Sales, key: pipeline });
      const hourlyData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

      result.forEach((el) => {
        hourlyData[el.hour - 1] = el.count;
      });
      return res.status(200).send(hourlyData);
    }

    // generate query for week
    if (req.query.type === 'week') {
      let curr = date;
      let first = curr.getDate() - curr.getDay();
      let last = first + 6;

      let firstDayOfWeek = new Date(curr.getFullYear(), curr.getMonth(), first);
      let lastDayOfWeek = new Date(curr.getFullYear(), curr.getMonth(), last);

      match.createdAt = { $gte: firstDayOfWeek, $lte: lastDayOfWeek };

      pipeline.push({ $match: match });
      pipeline.push({ $group: { _id: { day: { $dayOfWeek: { date: '$createdAt', timezone: req.query.timezone } } }, count: { $sum: 1 } } });
      pipeline.push({ $project: { _id: 0, day: '$_id.day', count: '$count' } });
      pipeline.push({ $sort: { 'day': 1 } });

      const result = await db.aggr({ table: Sales, key: pipeline });
      const weeklyData = [0, 0, 0, 0, 0, 0, 0];

      result.forEach((el) => {
        weeklyData[el.day - 1] = el?.count;
      });
      return res.status(200).send(weeklyData);
    }


    // generate query for day
    if (req.query.type === 'month') {
      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      match.createdAt = { $gte: firstDayOfMonth, $lte: lastDayOfMonth };

      pipeline.push({ $match: match });
      pipeline.push({ $group: { _id: { month: { $dayOfMonth: { date: '$createdAt', timezone: req.query.timezone } } }, count: { $sum: 1 } } });
      pipeline.push({ $project: { _id: 0, month: '$_id.month', count: '$count' } });
      pipeline.push({ $sort: { 'month': 1 } });

      const result = await db.aggr({ table: Sales, key: pipeline });

      const currentYear = date.getFullYear();
      const currentMonth = date.getMonth() + 1;

      const daysInCurrentMonth = new Date(currentYear, currentMonth, 0).getDate();

      const dailyData = Array(daysInCurrentMonth).fill(0);
      const categories = [];

      for (let i = 0; i < daysInCurrentMonth; i++) {
        categories[i] = i + 1;
      }

      result.forEach((el) => {
        dailyData[el.month - 1] = el.count;
      });
      return res.status(200).send({ categories, dailyData });
    }

    // generate query for month
    if (req.query.type === 'year') {
      const currentYear = date.getFullYear();
      const firstDayOfYear = new Date(currentYear, 0, 1);
      const lastDayOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);
      match.createdAt = { $gte: firstDayOfYear, $lte: lastDayOfYear };

      pipeline.push({ $match: match });
      pipeline.push({ $group: { _id: { month: { $month: { date: '$createdAt', timezone: req.query.timezone } } }, count: { $sum: 1 } } });
      pipeline.push({ $project: { _id: 0, month: '$_id.month', count: '$count' } });
      pipeline.push({ $sort: { 'month': 1 } });

      const result = await db.aggr({ table: Sales, key: pipeline });
      const monthData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      for (const data of result) {
        monthData[data.month - 1] = data.count;
      }
      return res.status(200).send(monthData);
    }

    // genereate query for year
    if (req.query.type === 'yearly') {
      pipeline.push({ $group: { _id: { year: { $year: { date: '$createdAt', timezone: req.query.timezone }} }, count: { $sum: 1 } } });
      pipeline.push({ $project: { _id: 0, year: '$_id.year', count: '$count' } });
      pipeline.push({ $sort: { 'year': 1 } });

      const result = await db.aggr({ table: Sales, key: pipeline });
      const categories = [];
      const yearData = [];

      result.forEach((elem) => {
        categories.push(elem.year);
        yearData.push(elem.count);
      });

      return res.status(200).send({ categories, yearData });
    }

    res.status(200).send([]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};

/**
 * Get Dashboard Store Report.
 * @param {Object} req - The request object containing the properties for the new user.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} The updated store object.
 */
export const storeSuperAdminChartReport = ({ db }) => async (req, res) => {
  const isValid = Object.keys(req.query).every(e => allowedQuery.has(e));
  if (!isValid || !req.query.timezone || req.user.role !== 'superadmin') return res.status(400).send('Bad Request');

  try {
    const match = {};

    const pipeline = [];
    const date = new Date();

    // generate query for day
    if (req.query.type === 'day') {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      match.createdAt = { $gte: startOfDay, $lte: endOfDay };

      pipeline.push({ $match: match });
      pipeline.push({ $group: { _id: { hour: { $hour: { date: '$createdAt', timezone: req.query.timezone } } }, count: { $sum: 1 } } });
      pipeline.push({ $project: { _id: 0, hour: '$_id.hour', count: '$count' } });
      pipeline.push({ $sort: { 'hour': 1 } });

      const result = await db.aggr({ table: Sales, key: pipeline });
      const hourlyData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

      result.forEach((el) => {
        hourlyData[el.hour - 1] = el.count;
      });
      return res.status(200).send(hourlyData);
    }

    // generate query for week
    if (req.query.type === 'week') {
      let curr = date;
      let first = curr.getDate() - curr.getDay();
      let last = first + 6;

      let firstDayOfWeek = new Date(curr.getFullYear(), curr.getMonth(), first);
      let lastDayOfWeek = new Date(curr.getFullYear(), curr.getMonth(), last);

      match.createdAt = { $gte: firstDayOfWeek, $lte: lastDayOfWeek };

      pipeline.push({ $match: match });
      pipeline.push({ $group: { _id: { day: { $dayOfWeek: { date: '$createdAt', timezone: req.query.timezone } } }, count: { $sum: 1 } } });
      pipeline.push({ $project: { _id: 0, day: '$_id.day', count: '$count' } });
      pipeline.push({ $sort: { 'day': 1 } });

      const result = await db.aggr({ table: Sales, key: pipeline });
      const weeklyData = [0, 0, 0, 0, 0, 0, 0];

      result.forEach((el) => {
        weeklyData[el.day - 1] = el?.count;
      });
      return res.status(200).send(weeklyData);
    }


    // generate query for day
    if (req.query.type === 'month') {
      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      match.createdAt = { $gte: firstDayOfMonth, $lte: lastDayOfMonth };

      pipeline.push({ $match: match });
      pipeline.push({ $group: { _id: { month: { $dayOfMonth: { date: '$createdAt', timezone: req.query.timezone } } }, count: { $sum: 1 } } });
      pipeline.push({ $project: { _id: 0, month: '$_id.month', count: '$count' } });
      pipeline.push({ $sort: { 'month': 1 } });

      const result = await db.aggr({ table: Sales, key: pipeline });

      const currentYear = date.getFullYear();
      const currentMonth = date.getMonth() + 1;

      const daysInCurrentMonth = new Date(currentYear, currentMonth, 0).getDate();

      const dailyData = Array(daysInCurrentMonth).fill(0);
      const categories = [];

      for (let i = 0; i < daysInCurrentMonth; i++) {
        categories[i] = i + 1;
      }

      result.forEach((el) => {
        dailyData[el.month - 1] = el.count;
      });
      return res.status(200).send({ categories, dailyData });
    }

    // generate query for month
    if (req.query.type === 'year') {
      const currentYear = date.getFullYear();
      const firstDayOfYear = new Date(currentYear, 0, 1);
      const lastDayOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);
      match.createdAt = { $gte: firstDayOfYear, $lte: lastDayOfYear };

      pipeline.push({ $match: match });
      pipeline.push({ $group: { _id: { month: { $month: { date: '$createdAt', timezone: req.query.timezone } } }, count: { $sum: 1 } } });
      pipeline.push({ $project: { _id: 0, month: '$_id.month', count: '$count' } });
      pipeline.push({ $sort: { 'month': 1 } });

      const result = await db.aggr({ table: Sales, key: pipeline });
      const monthData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      for (const data of result) {
        monthData[data.month - 1] = data.count;
      }
      return res.status(200).send(monthData);
    }

    // genereate query for year
    if (req.query.type === 'yearly') {
      pipeline.push({ $group: { _id: { year: { $year: { date: '$createdAt', timezone: req.query.timezone }} }, count: { $sum: 1 } } });
      pipeline.push({ $project: { _id: 0, year: '$_id.year', count: '$count' } });
      pipeline.push({ $sort: { 'year': 1 } });

      const result = await db.aggr({ table: Sales, key: pipeline });
      const categories = [];
      const yearData = [];

      result.forEach((elem) => {
        categories.push(elem.year);
        yearData.push(elem.count);
      });

      return res.status(200).send({ categories, yearData });
    }

    res.status(200).send([]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};

// This function calculate daily and yearly sales using aggregation
async function getSales(match) {
  try {
    const result = await Sales.aggregate([
      { $match: match },
      { $group: { _id: null, totalSales: { $sum: '$subTotal' } } },
      { $project: { _id: 0, totalSales: 1 } }
    ]);
    if (result.length > 0) return result[0];
    else return { totalSales: 0 };
  } catch (error) {
    console.log(error);
    throw new Error('Something went wrong');
  }
}

// This function calculate daily and yearly cost using aggregation.
async function getCost(match) {
  try {
    const result = await Sales.aggregate([
      { $match: match },
      { $unwind: '$products' },
      { $lookup: { from: 'products', localField: 'products.item', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $group: { _id: null, totalCost: { $sum: { $multiply: ['$products.quantity', '$product.buyingPrice'] } } } },
      { $project: { _id: 0, totalCost: 1 } }
    ]);
    if (result.length > 0) return result[0];
    else return { totalCost: 0 };
  } catch (error) {
    console.log(error);
    throw new Error('Something went wrong');
  }
}

async function topProducts(match) {
  try {
    return await Sales.aggregate([
      { $match: match },
      { $unwind: '$products' },
      { $group: { _id: '$products.item', dailySales: { $sum: '$products.quantity' } } },
      { $sort: { dailySales: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { _id: 1, dailySales: 1, name: '$product.name' } },
    ]);
  } catch (error) {
    console.log(error);
    throw new Error('Something went wrong');
  }
}