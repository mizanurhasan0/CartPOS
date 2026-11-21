import { Schema, model, connection } from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import autoIncrement from '../../utils/mongooseAutoIncrement';

const schema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String },
  role: { type: String, required: true, enum: ['superadmin', 'admin', 'user'], default: 'user' },
  status: { type: Boolean, required: true, default: true },
  address: { type: String, required: true },
  store: { type: Schema.Types.ObjectId, ref: 'Store' },
  setting: { type: Schema.Types.ObjectId, ref: 'Setting' },
}, { timestamps: true, versionKey: false });

schema.plugin(paginate);
schema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  delete obj.password;
  return JSON.parse(JSON.stringify(obj).replace(/_id/g, 'id'));
};

autoIncrement.initialize(connection);
schema.plugin(autoIncrement.plugin, {
  model: 'User',
  field: 'userId',
  startAt: 1,
  incrementBy: 1
});

export default model('User', schema);