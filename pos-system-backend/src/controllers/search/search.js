import { create as ocreate, insert as oinsert, remove as oremove, search as osearch } from '@orama/orama';
import { persistToFile } from '@orama/plugin-data-persistence/server';
import path from 'path';
import fs from 'fs';
import { schemas } from './schemas';

// const eventsToHandle = ['SIGTERM', 'SIGINT', 'unhandledRejection', 'uncaughtException', 'SIGUSR2'];

/**
 * SearchCtrl is a class that encapsulates methods for starting and controlling Orama search instances,
 * as well as methods for inserting, removing and searching data within those instances.
 *
 * Orama v3 keeps its index in memory and uses a different binary format than v1, so the old
 * `.msp` cache files cannot be restored. The index is rebuilt from MongoDB on every start
 * (see `reindexSearch`), and the cache files are rewritten in the v3 format.
*/
export default class SearchCtrl {
  constructor() {
    /**
     * This object will store the Orama search instances for each schema.
     * @type {Object}
    */
    this.instances = {};
    /**
     * The data path where the instances will be persisted.
     * @type {string}
    */
    this.dataPath = path.join(path.resolve(), '.cache');
    /**
     * The schemas for the Orama instances.
     * @type {Object}
    */
    this.schemas = schemas;
  }

  /**
   * Saves the instances specified by the `keys` argument to disk
   *
   * @param {Array<string>} [keys=Object.keys(this.schemas)] - The keys of the instances to save
   * @returns {Promise<Array>} - A Promise that resolves to an array of the results of saving each instance to disk
  */
  save(keys = Object.keys(this.schemas)) {
    return Promise.all(keys.map((k) => persistToFile(this.instances[k], 'binary', path.join(this.dataPath, k + '.msp'))));
  }

  /**
   * Starts the search controller and creates an empty instance for each schema.
   * Documents are added afterwards by `reindexSearch` and by the services as data changes.
  */
  async start() {
    if (!fs.existsSync(this.dataPath)) fs.mkdirSync(this.dataPath, { recursive: true });
    const keys = Object.keys(this.schemas);
    keys.forEach((k) => (this.instances[k] = ocreate({ schema: this.schemas[k] })));
    await this.save(keys);

    console.log('=> Search controller started');
  }

  /**
   * insert method that inserts data into an Orama search instance.
   * @param {string} key - The key of the Orama instance to insert data into.
   * @param {Object} value - The data to be inserted. Its `id` is used as the document id.
   * @return {Promise} - Promise object represents the inserted data.
  */
  async insert(key, value) {
    return await oinsert(this.instances[key], value);
  }

  /**
   * Removes a document from the given key by its id
   *
   * @async
   * @param {string} key - The key to remove the document from
   * @param {string} id - The id of the document to remove
   * @returns {Promise<void>}
  */
  async remove(key, id) {
    try {
      await oremove(this.instances[key], id);
    }
    catch (e) {
      //
    }
  }

  /**
   * Searches for documents in the given key using a query
   *
   * @async
   * @param {string} key - The key to search documents in
   * @param {Object} query - The query object to search documents with
   * @param {string} query.term - The search term to use, defaults to an empty string
   * @param {string} query.properties - The properties to search in, defaults to '*'
   * @returns {Promise<any>} - The result of the search operation
  */
  async search(key, query) {
    return await osearch(this.instances[key], {
      ...query,
      term: query.term || '',
      properties: query.properties || '*'
    });
  }
}
