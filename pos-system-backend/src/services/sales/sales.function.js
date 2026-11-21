import Product from '../product/product.schema';
import { findOne, save } from '../../controllers/operations.js';


/**
 * This function is used for calculate product tax, update product quantity and sold.
 * @param {Array} products product is array of items which provided by user.
 * @param {Object} lyra lyra is instance of orama search for insert data for search
 */
export const calculateTaxAndUpdate = async (products, tax) => {
  try {
    const result = await Promise.all(products.map(async (prod) => {
      const product = await findOne({ table: Product, key: { id: prod.item } });

      const quantity = Math.abs(parseInt(prod.quantity));

      if (quantity >= product.stock) {
        prod.quantity = product.stock;

        product.stock -= prod.quantity;
        product.sold += prod.quantity;
      } else {
        product.stock -= quantity;
        product.sold += quantity;
      }

      await save(product);

      return { sellingPrice: product.sellingPrice, name: product.name, quantity: prod.quantity, discount: prod.discount, percentageDiscount: prod.percentageDiscount };
    }));


    const calculateDiscount = {
      subTotal: result.reduce((now, trig) => now + (trig.quantity * (trig.sellingPrice)), 0),
      discount: result.reduce((now, trig) => now + (trig.percentageDiscount ? (((trig?.sellingPrice) * (trig.discount / 100)) * trig.quantity) : trig.discount * trig.quantity), 0)
    };

    const totalTax = (calculateDiscount.subTotal - calculateDiscount.discount) * (tax / 100);

    const subTotal = ((calculateDiscount.subTotal - calculateDiscount.discount) + Number(totalTax)).toFixed(2);

    return { subTotal, totalTax, totalDiscount: calculateDiscount.discount, products: result };
  } catch (error) {
    console.log(error);
    throw new Error('Something went wrong'); 
  }
};

/**
 * This function is used for notify all store user for low stock product.
 * @param {Array} products product is array of items which provided by user.
 * @param {Object} ws ws is instance of socket object.
 * @param {String} room Room is name of the store.
 */
export const notifyLowStockProduct = async ({ ws, room, products }) => {
  try {
    for (const product of products) {
      if (product.item.stock > 1 && product.item.stock <= 10) {
        ws.to(room).emit('lowStock', { item: product, date: Date.now() });
      }
      if (product.item.stock < 1) {
        ws.to(room).emit('stockOut', { item: product, date: Date.now() });
      }
    }
  } catch (error) {
    console.log(error);
    throw new Error('Something went wrong');
  }
};

/**
 * This function is used for generate invoice id.
 * @param {Array} products product is array of items which provided by user.
 */
export const invoiceId = () => {
  const text = 'ABCDEMNEFG3HIF343JKLEFGHIMNE5476FMNEF54QRSTMGHIFGGHIOPQR89STMN8EFGHIFG9WXYZ';
  const invoiceIdLength = 10;

  let invoiceId = '';
  for (let i = 0; i < invoiceIdLength; i++) {
    const randomIndex = Math.floor(Math.random() * text.length);
    invoiceId += text.charAt(randomIndex);
  }
  return `#${invoiceId}`;
};


/**
 * This function is used for calculate discount amount. if percentageDiscount is true then calculate discount amount in percentage otherwise return flat discount.
 * @param { Boolean } percentageDiscount discount type true or false.
 * @param { Number } discount amount of discount.
 * @param { Number } sellingPrice price of product.
 */
export const calculateProductDiscount = ({ percentageDiscount, discount, sellingPrice, quantity }) => {
  try {
    if (!percentageDiscount) return parseInt(discount);

    return ((sellingPrice * parseInt(discount)) / 100) * parseInt(quantity);
  } catch (error) {
    console.log(error);
    throw new Error('Failed to calculate tax amount');
  }
};