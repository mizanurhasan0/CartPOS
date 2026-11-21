

import { join, resolve } from 'path';

/**
 * @param getFile function is used to get file and serve user.
 * @param req.params contains the image filename.
 * @returns the image
 */
export const getFile = () => async (req, res) => {
  try {
    console.log(join(resolve(), 'images', req.params.filename));
    const image = join(resolve(), 'images', req.params.filename);
    if (!image) return res.status(400).send("Bad Request");
    res.status(200).sendFile(image);
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
};
