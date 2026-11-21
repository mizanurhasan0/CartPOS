import { Schema, model } from 'mongoose';

const schema = new Schema({
  paymentNotify: { type: Boolean, default: false },
  stockOut: { type: Boolean, default: true },
  lowStock: { type: Boolean, default: false },
  systemUpdate: { type: Boolean, default: false },
  newUser: { type: Boolean, default: false },
  newItem: { type: Boolean, default: false },
}, { versionKey: false });

export default model('Setting', schema);