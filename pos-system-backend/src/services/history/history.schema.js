import { Schema, model, connection } from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import autoIncrement from '../../utils/mongooseAutoIncrement';

const schema = new Schema({
  store: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Store'
  },
  name: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    required: true,
    enum: ['sell', 'expense', 'restock', 'others']
  },
  cost: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['revenue', 'expense']
  },
}, { timestamps: true, versionKey: false });

schema.plugin(paginate);

schema.methods.toJSON = function () {
  const obj = this.toObject();
  return JSON.parse(JSON.stringify(obj).replace(/_id/g, 'id'));
};

autoIncrement.initialize(connection);
schema.plugin(autoIncrement.plugin, {
  model: 'History',
  field: 'uid',
  startAt: 1,
  incrementBy: 1
});

export default model('History', schema);