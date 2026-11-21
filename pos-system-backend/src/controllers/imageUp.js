import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

// const uniq = () => new Date().getTime().toString() + Math.ceil(Math.random() * 1000).toString();
const imagesDir = `${path.resolve()}/images`;

/**
 * Saves an image to the server from the provided link.
 *
 * @param {string} link - The link to the image.
 * @returns {string} The file path of the saved image.
 */
// export const imageUp = async link => {
//   try {
//     if (!link) return null;
//     const extIndex = link.lastIndexOf('.');// Check if link has a file extension
//     if (extIndex === -1) throw new Error('Link does not contain a file extension.');
//     const ext = link.substring(extIndex + 1);// Get file extension
//     if (!['png', 'jpg', 'jpeg', 'svg', 'gif', 'avif', 'webp'].includes(ext.toLowerCase())) throw new Error('Invalid file extension.');// Check if file extension is valid
//     const fileName = randomBytes(16).toString('hex') + '.' + ext;// Generate a unique file name
//     if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);
//     const buffer = fs.readFileSync(link);// Read image file from link
//     const filePath = `${imagesDir}/${fileName}`;// Write image file to images directory
//     fs.writeFileSync(filePath, buffer);
//     return `${fileName}`;// Return file path
//   } catch (e) {
//     console.error(e);
//     throw new Error('Failed to save image.');
//   }
// };


export const imageUp = async (file) => {
  try {
    if (!file) return null;
    if (file.size > 4194304) throw new Error('File size limit exceeded');
    const extIndex = file.path.lastIndexOf('.');// Check if file.path has a file extension
    if (extIndex === -1) throw new Error('Link does not contain a file extension.');
    const ext = file.path.substring(extIndex + 1);// Get file extension
    if (!['png', 'jpg', 'jpeg'].includes(ext.toLowerCase())) throw new Error('Invalid file extension.');// Check if file extension is valid
    const fileName = randomBytes(16).toString('hex') + '.' + ext;// Generate a unique file name
    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);
    const buffer = fs.readFileSync(file.path);// Read image file from file.path
    const filePath = `${imagesDir}/${fileName}`;// Write image file to images directory
    fs.writeFileSync(filePath, buffer);
    return `${fileName}`;// Return file path
  } catch (e) {
    console.error(e);
    throw new Error(e.message || 'Failed to save image.');
  }
};