import { Schema, model, connection } from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import autoIncrement from '../../utils/mongooseAutoIncrement';

const schema = new Schema({
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  cashier: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{
    item: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    // tax: { type: Number },
    quantity: { type: Number, required: true, default: 1 },
    percentageDiscount: { type: Boolean, required: true, default: false },
    discount: { type: Number, required: true, default: 0 },
    discountAmount: { type: Number }
  }],
  store: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
  subTotal: { type: Number },
  totalTax: { type: Number },
  totalDiscount: { type: Number },
  invoiceId: { type: String },
  flatDiscount: { type: Number },
  paymentMethod: { type: String, required: true, enum: ['cash', 'card'], default: 'cash' },
}, { timestamps: true, versionKey: false });

schema.plugin(paginate);

schema.methods.toJSON = function () {
  const obj = this.toObject();
  // populated cashier is a full User document; never send its password hash
  if (obj.cashier && typeof obj.cashier === 'object') delete obj.cashier.password;
  return JSON.parse(JSON.stringify(obj).replace(/_id/g, 'id'));
};

autoIncrement.initialize(connection);
schema.plugin(autoIncrement.plugin, {
  model: 'Sales',
  field: 'salesId',
  startAt: 1,
  incrementBy: 1
});

export default model('Sales', schema);