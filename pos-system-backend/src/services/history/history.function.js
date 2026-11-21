import * as operations from '../../controllers/operations.js';
import History from '../history/history.schema';
/**
 * This function is used to create history for each product for a bill or user-sale.
 * @param {Array} products product is array of items which is included in the invoice.
 * @param { ObjectId } store object id for identify sotre
 * @param { Object } lyra is instance of orama search
 * @param { String } invoiceId is sales invoice id for indentify sales history
 */
export const createProductHistories = async (products, store, lyra, invoiceId) => {
  try {
    const histories = await Promise.all(products.map(async (prod) => {
      // const product = await operations.findOne({ table: Product, key: { id: prod.item } });
      // if (!prod) return 0;
      const rawHistory = {
        name: prod.name,
        purpose: 'sell',
        cost: prod.sellingPrice,
        quantity: parseInt(prod.quantity),
        type: 'revenue',
        total: ((prod.percentageDiscount ? ((prod.sellingPrice - (prod.sellingPrice * (Number(prod.discount) / 100))) * prod.quantity) : (prod.sellingPrice * prod.quantity - Number(prod.discount))) + ((prod.percentageDiscount ? (prod.sellingPrice - (prod.sellingPrice * (Number(prod.discount) / 100))) * prod.quantity : (prod.sellingPrice * prod.quantity - Number(prod.discount))) * (store.taxPercent / 100))),
        store: store.id
      };

      const history = await operations.create({ table: History, key: rawHistory });

      // insert data into lyra history
      await lyra.insert('history', { id: history._id.toString(), name: `${prod.name} ${invoiceId ? invoiceId : ''}` });

      return history;
    }));
    return histories;
  } catch (error) {
    console.log(error);
    throw new Error('Something went wrong');
  }
};

/**
 * This function is used to create history for each product for a bill or user-sale.
 * @param {Array} products product is array of items which is included in the invoice.
 * @param { Object } rawHistory history object
 * @param { Object } lyra is instance of orama search
 * @param { String } invoiceId is sales invoice id for indentify sales history
 */
export const createOneHistory = async (rawHistory, lyra, invoiceId) => {
  try {
    const history = await operations.create({ table: History, key: rawHistory });

    // insert history into lyra
    await lyra.insert('history', { id: history._id.toString(), name: `${rawHistory.name} ${invoiceId ? invoiceId : ''}`});
    return history;
  } catch (error) {
    console.log(error);
    throw new Error('Something went wrong');
  }
}; 