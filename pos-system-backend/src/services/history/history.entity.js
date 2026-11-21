import rearrageSearch from '../../utils/rearrageSearch';
import History from './history.schema';
import { Types } from 'mongoose';


/**
 * this is mutating the date prototype of javascript core.
 * main purpose to add a method to get week.
 * @returns new method to find get week of a day
 */
Date.prototype.getWeek = function () {
  const date = new Date(this);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

const allowedQuery = new Set(['page', 'limit', 'id', '_id', 'paginate', 'sortBy', 'store', 'search', 'createdAt', 'purpose']);

const category = {
  weekly: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  monthly: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

const validator = {
  type: ['revenue', 'expense'],
  chartType: ['weekly', 'monthly', 'yearly'],
};

/**
 * @param {Object} req - The request object containing the properties for history.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} - get all history object.
 */
export const getAll = ({ db, lyra }) => async (req, res) => {
  try {
    // implementing orama search
    if (req.query.search) {
      const data = await lyra.search('history', { term: req.query.search });
      const Ids = data.hits.map(elem => elem.id);
      req.query.id = { $in: Ids };
      req.query.page = 1;
      delete req.query.search;
    }

    // only super admin can pass store id via query params
    req.user.role !== 'superadmin' ? req.query.store = req.user.store.toString() : '';

    let history = await db.find({ table: History, key: { allowedQuery, query: { sortBy: 'createdAt:desc', ...req.query }, populate: { path: 'store' } } });

    // mongodb find method change the serial of lyra search data. apply sorting for lyra search and mongodb search serial same.
    if (req.query.id) {
      history = await rearrageSearch(req.query, history);
    }

    res.status(200).send(history);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
};

/**
 * this function is used to get the accounts related data for a specific store.
 * @param {Object} req - The request object containing the properties for history.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} - the response object.
 */
export const storeTransectionStat = ({ db }) => async (req, res) => {
  const id = req.params.id;
  const storeId = req.user.role === 'superadmin' ? new Types.ObjectId(id) : req.user.store;
  if (!storeId) return res.status(400).send('Bad requesst');

  const aggrParams = [
    {
      '$match': {
        'store': storeId,
      }
    }, {
      '$group': {
        '_id': null,
        'totalTransection': {
          '$sum': '$total'
        },
        'totalRevenue': {
          '$sum': {
            '$cond': [
              {
                '$eq': [
                  '$type', 'revenue'
                ]
              }, '$total', 0
            ]
          }
        },
        'totalExpense': {
          '$sum': {
            '$cond': [
              {
                '$eq': [
                  '$type', 'expense'
                ]
              }, '$total', 0
            ]
          }
        }
      }
    }, {
      '$addFields': {
        'netProfit': {
          '$subtract': [
            '$totalRevenue', '$totalExpense'
          ]
        }
      }
    },
  ];

  const rawStats = await db.aggr({ table: History, key: aggrParams });
  const stats = {
    totalTransection: rawStats?.[0]?.totalTransection || 0,
    totalRevenue: rawStats?.[0]?.totalRevenue || 0,
    totalExpense: rawStats?.[0]?.totalExpense || 0,
    netProfit: rawStats?.[0]?.netProfit || 0,
  };
  return res.status(200).send(stats);
};

/**
 *
 * @param {String} type is the type of the chart(weekly, yearly or monthly).
 * @param {Date} firstDate is the start range to formate the category of the response of network request object.
 * @param {Date} lastDate is the end range to formate the category of the response of network request object.
 * @returns the array of the category of the response of network request object.
 */
function getDateArray(type, firstDate, lastDate) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  if (type === 'yearly') {
    if (!firstDate || !lastDate) {
      return Array.from({ length: 8 }, (_, i) => currentYear - 7 + i);
    }
  } else if (type === 'monthly') {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  } else if (type === 'weekly' && firstDate && lastDate) {
    return Array.from({ length: 7 }, (_, i) => i + 1);
  }

  throw new Error('Invalid date range or missing parameters');
}

/**
 * this function is used to get the range for extracting the data.
 * @param {String} type is the type of the chart(weekly, yearly or monthly).
 * @returns the date range to find data.
 */
function getCurrentDateRange(type) {
  const currentDate = new Date();

  if (type === 'monthly') {
    const firstDate = new Date(currentDate.getFullYear(), 0, 1);
    const lastDate = new Date(currentDate.getFullYear(), 11, 31);
    return {
      'createdAt': {
        '$gte': firstDate,
        '$lt': lastDate
      }
    };
  } else if (type === 'weekly') {
    const currentDay = currentDate.getDay();
    const firstDate = new Date(currentDate);
    firstDate.setDate(currentDate.getDate() - currentDay);
    const lastDate = new Date(currentDate);
    lastDate.setDate(currentDate.getDate() + (6 - currentDay));
    return {
      'createdAt': {
        '$gte': firstDate,
        '$lt': lastDate
      }
    };
  } else if (type === 'yearly') {
    return {};
  }
}


/**
 * this function is used to make the aggregate query stage for various type and charttype.
 * @param {String} chartType the type of the chart.
 * @param {String} type the target of the chart to show.
 * @param {Object.Id} id is the mongoose object id of a store.
 * @param {object} range the time range to extract data.
 * @returns the query stage array.
 */
function aggQuery(chartType = 'yearly', type = 'revenue', id, range) {
  const object = {
    yearly: '$year',
    monthly: '$month',
    weekly: '$dayOfWeek',
  };

  const query = [
    {
      '$match': {
        'store': id,
        'type': type,
        ...range,
      }
    }, {
      '$group': {
        '_id': {
          [object[chartType]]: '$createdAt'
        },
        'total': {
          '$sum': '$total'
        }
      }
    }, {
      '$sort': {
        '_id': 1
      }
    }
  ];
  return query;
}

/**
 * this function is used to get the accounts chart data for a specific store.
 * @param {Object} req - The request object containing the properties for history.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} - the response object.
 */
export const generateChart = ({ db }) => async (req, res) => {
  let { id, chartType, type } = req.params;
  if (!id || !chartType || !type) return req.status(400).send('Bad request');

  validator.chartType.includes(chartType) ? chartType : chartType = validator.chartType[0];
  validator.type.includes(type) ? type : type = validator.type[0];

  const storeId = req.user.role === 'superadmin' ? new Types.ObjectId(id) : req.user.store;

  const range = getCurrentDateRange(chartType);

  const stages = aggQuery(chartType, type, storeId, range);

  const aggrRes = await db.aggr({ table: History, key: stages });

  const { $gte = '', $lt = '' } = range?.createdAt || {};

  const dataFormate = getDateArray(chartType, $gte, $lt);

  const response = {
    categories: chartType === 'yearly' ? dataFormate : category[chartType],
    series: [
      {
        name: type,
        data: dataFormate.map((ech) => {
          const finds = aggrRes.find((ec) => ec._id === ech);
          return finds?.total || 0;
        }),
      }
    ]
  };
  res.status(200).send(response);
};

/**
 * @param {Object} req - The request object containing the properties for history.
 * @param {Object} db - The database object for interacting with the database.
 * @returns {Object} - New Bill.
 */
export const addBill = ({ db, lyra }) => async (req, res) => {
  try {
    const { name, purpose, cost, quantity, type } = req.body;

    const data = { store: req.user.store.toString(), name, purpose, cost, quantity, total: (cost * quantity), type: purpose === 'sell' ? 'revenue' : (purpose === 'restock' || purpose === 'expense') ? 'expense' : type };

    const bill = await db.create({ table: History, key: { ...data } });
    if (!bill) return res.status(400).send('Bad Request');

    // add history to lyra search
    await lyra.insert('history', { id: bill._id.toString(), name });

    res.status(200).send(bill);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
};