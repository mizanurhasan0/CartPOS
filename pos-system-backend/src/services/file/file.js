

import { getFile } from './file.entity'
export default function file() {

  /**
  * GET /file/:filename
  * @description This route is used to get file.
  * @response {Object} 200 - get file.
  */
  this.route.get('/file/:filename', getFile(this));
}
