/**
 * This function is used to calculate custom pagination.
 * @param {Array} docs docs is array of items.
 * @param {Number} page page is current page number.
 * @param {Number} limit limit is limit of data.
 */
export default function ({ docs, page, limit }) {
  try {
    return {
      docs,
      totalDocs: docs.length,
      page,
      limit,
      totalPages: Math.ceil(docs.length / limit),
      prevPage: () => (this.totalDocs / this.limit) <= this.page ? this.page - 1 : null,
      nextPage: () => (this.totalDocs / this.limit) >= this.page ? this.page + 1 : null,
    }
  } catch (error) {
    console.log(error);
    throw new Error('Something went wrong');
  }

}