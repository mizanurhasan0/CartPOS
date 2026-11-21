import { connect, set } from 'mongoose';

export default async function (settings) {
  // Set mongoose properties
  set('strictQuery', true);
  // Mongoose 6 silently ignored populate on paths missing from a schema; keep that behaviour
  set('strictPopulate', false);

  // Connect (Mongoose 7+ dropped the callback form, so use the promise API)
  await connect(settings.MONGODB_URL); // keepAlive is on by default in the driver
  return 'Connected to MongoDB';
}