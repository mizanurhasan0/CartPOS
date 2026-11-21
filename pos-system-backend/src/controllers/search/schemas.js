export const schemas = {
  user: {
    id: 'string',
    name: 'string',
  },
  store: {
    id: 'string',
    name: 'string'
  },
  category: {
    id: 'string',
    name: 'string'
  },
  product: {
    id: 'string',
    name: 'string',
    productCode: 'string'
  },
  sales: {
    id: 'string',
    invoiceId: 'string',
    cashierName: 'string',
    customerName: 'string',
  },
  history: {
    id: 'string',
    name: 'string',
  }
};