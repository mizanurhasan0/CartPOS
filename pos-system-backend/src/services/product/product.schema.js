import { Schema, model, connection } from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import autoIncrement from '../../utils/mongooseAutoIncrement';

const schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  store: { type: Schema.Types.ObjectId, ref: 'Store' },
  productCode: { type: String, required: true },
  buyingPrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  // tax: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  restock: { type: Boolean, default: false },
  sold: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'deactive'], default: 'active' }
}, { timestamps: true, versionKey: false });

schema.plugin(paginate);

schema.methods.toJSON = function () {
  const obj = this.toObject();
  return JSON.parse(JSON.stringify(obj).replace(/_id/g, 'id'));
};

autoIncrement.initialize(connection);
schema.plugin(autoIncrement.plugin, {
  model: 'Product',
  field: 'productId',
  startAt: 1000,
  incrementBy: 1
});

export default model('Product', schema);