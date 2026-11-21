import { Schema, model, connection } from 'mongoose';
import autoIncrement from '../../utils/mongooseAutoIncrement';
import paginate from 'mongoose-paginate-v2';

const schema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  image: { type: String },
  status: { type: String, enum: ['active', 'deactive'], default: 'active' },
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  taxPercent: { type: Number },
  maxLogedIn: { type: Number, default: 5 },
  logedInUser: [{ user: { type: Schema.Types.ObjectId, ref: 'User' }, session: { type: String } }],
  currency: { name: { type: String }, symbol: { type: String } }
}, { timestamps: true, versionKey: false });

schema.methods.toJSON = function () {
  const obj = this.toObject();
  return JSON.parse(JSON.stringify(obj).replace(/_id/g, 'id'));
};

schema.plugin(paginate);
autoIncrement.initialize(connection);
schema.plugin(autoIncrement.plugin, {
  model: 'Store',
  field: 'storeId',
  startAt: 1000,
  incrementBy: 1
});

export default model('Store', schema);