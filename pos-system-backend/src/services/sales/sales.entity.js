import Sales from './sales.schema';
import { calculateTaxAndUpdate, notifyLowStockProduct, invoiceId } from './sales.function';
import Store from '../store/store.schema';
import { createOneHistory, createProductHistories } from '../history/history.function';
import { idOf } from '../middlewares';
import Product from '../product/product.schema';
import rearrageSearch from '../../utils/rearrageSearch';
const createAllowed = new Set(['customerName', 'customerPhone', 'products', 'cashier', 'store', 'paymentMethod', 'flatDiscount']);
const allowedQuery = new Set(['page', 'limit', 'id', '_id', 'paginate', 'populate', 'sortBy', 'store', 'search',]);

/**
 * @param {Object} req - The request object containing the properties for the sales.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} The created sales object.
 */
export const create = ({ db, ws, lyra }) => async (req, res) => {
  try {
    // check user provide valid properties
    const isValid = Object.keys(req.body).every(key => createAllowed.has(key));
    if (!isValid) return res.status(400).send('Bad Request');

    const store = await db.findOne({ table: Store, key: { id: req.user.store } });
    if (!store) throw new Error('Something went wrong');

    // calculate product tax and update product stock and sold
    const data = await calculateTaxAndUpdate(req.body.products, store.taxPercent);
    // req.body.products = updatedProduct;
    req.body.totalTax = data.totalTax;
    req.body.totalDiscount = data.totalDiscount;
    req.body.subTotal = Math.round(data.subTotal - Number(req.body.flatDiscount));
    req.body.invoiceId = invoiceId();
    req.body.store = store._id.toString();
    req.body.cashier = req.user._id.toString(); // the logged-in user is always the cashier

    let sales = await db.create({ table: Sales, key: { ...req.body, populate: { path: 'store products.item', select: 'taxPercent name buyingPrice sellingPrice tax stock sold' } } });
    sales = await db.populate(sales, { path: 'cashier store' });

    // create history from here
    await createProductHistories(data.products, store, lyra, sales.invoiceId.replace('#', ''));

    // after creating sales check all product stock if stock low emit event to all store user
    await notifyLowStockProduct({ products: sales.products, ws, room: req.user.store._id.toString() });

    // add sales data to lyra search
    await lyra.insert('sales', { id: sales._id.toString(), invoiceId: sales.invoiceId.replace('#', ''), customerName: sales.customerName, cashierName: sales.cashier.fullName });

    return res.status(200).send(sales);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
};

/**
 * @param {Object} req - The request object containing the properties for sales.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} - get sales  information by id object.
 */
export const get = ({ db }) => async (req, res) => {
  try {
    const sales = await db.findOne({ table: Sales, key: { id: req.params.id, store: req.user.store, populate: { path: 'cashier store products.item', select: 'buyingPrice sellingPrice tax stock sold productCode name address phone image status owner users taxPercent currency fullName' } } });
    sales.cashier.password = undefined;

    if (!sales) return res.status(400).send('Sales not found');
    res.status(200).send(sales);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
};

/**
 * @param {Object} req - The request object containing the properties for sales.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} - get all sales object.
 */
export const getAll = ({ db, lyra }) => async (req, res) => {
  try {
    if (req.query.search) {
      const data = await lyra.search('sales', { term: req.query.search });
      const Ids = data.hits.map(elem => elem.id);
      req.query.id = { $in: Ids };
      req.query.page = 1;
      delete req.query.search;
    }

    // only super admin can pass store id via query params
    req.user.role !== 'superadmin' ? req.query.store = req.user.store : '';

    let sales = await db.find({ table: Sales, key: { allowedQuery, query: { sortBy: 'createdAt:desc', ...req.query }, populate: { path: 'products.item store cashier' } } });

    // mongodb find method change the serial of lyra search data. apply sorting for lyra search and mongodb search serial same.
    if (req.query.id) {
      sales = await rearrageSearch(req.query, sales);
    }

    res.status(200).send(sales);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
};


/**
 * this function is used for calculate refund and update the bill after refund.
 * @param {Object} req - The req object contains the network request object.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} The updated bill object.
 */
export const refundSales = ({ db, lyra }) => async (req, res) => {
  try {
    const productsWithQty = req.body;
    const bill = await db.findOne({ table: Sales, key: { id: req.query.sales } });
    if (!bill || idOf(bill.store) !== idOf(req.user.store)) return res.status(404).send('Bill not found');
    const store = await db.findOne({ table: Store, key: { id: bill.store } });
    const validReq = bill.products.every((ech) => {
      // console.log(ech.quantity, productsWithQty[ech.item.toString()]);
      if ((ech.quantity <= productsWithQty[ech.item.toString()]) || (productsWithQty[ech.item.toString()] < 0)) return false;
      return true;
    });
    if (!productsWithQty || !bill || !store || !validReq) return res.status(400).send('Bad request');

    await Promise.all(Object.keys(productsWithQty).map(async (ech) => {
      const product = await db.findOne({ table: Product, key: { id: ech } });
      const item = bill.products.find((e) => e.item.toString() === ech);

      // if (item.quantity <= productsWithQty[ech]) return res.status(400).send('Bad Request'); //may have wrong

      const qty = item.quantity - productsWithQty[ech];
      // const amount = item.percentageDiscount ? ((product.sellingPrice - (product.sellingPrice * (item.discount / 100))) * qty) + ((product.sellingPrice - (product.sellingPrice * (item.discount / 100))) * qty) * (store.taxPercent / 100) : (((product.sellingPrice * qty) - item.discount) + ((product.sellingPrice * qty) - item.discount) * (store.taxPercent / 100));
      const amount = ((product.sellingPrice - (item.percentageDiscount ? (product.sellingPrice * (item.discount / 100)) : item.discount)) * qty) + (((product.sellingPrice - (item.percentageDiscount ? (product.sellingPrice * (item.discount / 100)) : item.discount)) * qty) * (store.taxPercent / 100));
      product.stock = product.stock + qty;
      product.sold = product.sold - qty;

      await db.save(product);
      bill.products.map((ec) => {
        if (ec.item.toString() === ech) {
          ec.quantity = productsWithQty[ech];
          return ec;
        }
        return ec;
      });

      bill.subTotal = bill.subTotal - amount;
      bill.totalDiscount = bill.totalDiscount - (item.percentageDiscount ? (product.sellingPrice * (item.discount / 100)) * qty : item.discount * qty);
      bill.totalTax = bill.totalTax - (((product.sellingPrice - (item.percentageDiscount ? (product.sellingPrice * (item.discount / 100)) : item.discount)) * qty) * (store.taxPercent / 100));

      return createOneHistory({ store: bill.store, name: 'Item refund', purpose: 'restock', cost: product.sellingPrice, quantity: qty, type: 'expense', total: amount }, lyra, bill.invoiceId.replace('#', ''));
    }));
    bill.subTotal = bill.subTotal + bill.flatDiscount;
    bill.flatDiscount = 0;
    let updated = await db.save(bill);
    updated = await db.populate(updated, { path: 'cashier store products.item' });
    return res.status(200).send(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
};