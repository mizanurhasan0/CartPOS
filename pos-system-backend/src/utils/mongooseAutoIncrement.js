/**
 * Auto-increment plugin for Mongoose 9.
 *
 * Replaces the abandoned `mongoose-auto-increment` package (it only supports
 * Mongoose 4/5 and relies on callbacks that Mongoose 9 removed).
 *
 * It keeps the same API (`initialize(connection)` + `plugin(schema, options)`) and the
 * same storage layout (`identitycounters` collection with `{ model, field, count }`),
 * so counters already stored in an existing database continue from where they stopped.
 */
import { Schema, connection as defaultConnection } from 'mongoose';

let IdentityCounter = null;

export const initialize = (connection = defaultConnection) => {
  if (IdentityCounter) return;
  const counterSchema = new Schema({
    model: { type: String, required: true },
    field: { type: String, required: true },
    count: { type: Number, default: 0 },
  });
  counterSchema.index({ field: 1, model: 1 }, { unique: true });
  IdentityCounter = connection.models.IdentityCounter || connection.model('IdentityCounter', counterSchema);
};

export const plugin = (schema, options = {}) => {
  if (!IdentityCounter) initialize();

  const settings = { field: '_id', startAt: 0, incrementBy: 1, unique: true, ...options };
  if (!settings.model) throw new Error('model must be set');

  if (!schema.path(settings.field)) {
    schema.add({ [settings.field]: { type: Number, ...(settings.field !== '_id' && { unique: settings.unique }) } });
  }

  const counterQuery = { model: settings.model, field: settings.field };

  schema.pre('save', async function () {
    if (!this.isNew) return;

    // A number was provided explicitly: move the counter forward so it never hands out a used value.
    if (typeof this[settings.field] === 'number') {
      await IdentityCounter.updateOne({ ...counterQuery, count: { $lt: this[settings.field] } }, { count: this[settings.field] });
      return;
    }

    await IdentityCounter.updateOne(counterQuery, { $setOnInsert: { count: settings.startAt - settings.incrementBy } }, { upsert: true });
    const counter = await IdentityCounter.findOneAndUpdate(counterQuery, { $inc: { count: settings.incrementBy } }, { new: true });
    this[settings.field] = counter.count;
  });
};

export default { initialize, plugin };
