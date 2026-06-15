const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fairford';

function getModel(table) {
  return mongoose.models[table] ||
    mongoose.model(table, new mongoose.Schema({ id: Number }, { strict: false, versionKey: false }), table);
}

const Counter = mongoose.models.Counter ||
  mongoose.model('Counter', new mongoose.Schema({ _id: String, seq: { type: Number, default: 0 } }));

async function nextId(table) {
  const doc = await Counter.findByIdAndUpdate(table, { $inc: { seq: 1 } }, { returnDocument: 'after', upsert: true });
  return doc.seq;
}

async function findAll(table, filter = {}) {
  return getModel(table).find(filter, { _id: 0 }).lean();
}
 
async function findById(table, id) {
  return getModel(table).findOne({ id: parseInt(id) }, { _id: 0 }).lean();
}

async function insert(table, data) {
  const id = await nextId(table);
  const row = { id, ...data };
  await getModel(table).create(row);
  return row;
}

async function update(table, id, patch) {
  
  return getModel(table).findOneAndUpdate(
    { id: parseInt(id) },
    { $set: patch },
    { returnDocument: 'after', projection: { _id: 0 } }  
  ).lean();
}

async function updateWhere(table, filter, patch) {
  const result = await getModel(table).updateMany(filter, { $set: patch });
  return result.modifiedCount;
}

async function remove(table, id) {
  const result = await getModel(table).deleteOne({ id: parseInt(id) });
  return result.deletedCount;
}

/* ── Seed data ── */
const SEED = require('./seed');

async function seedIfEmpty() {
  for (const [table, rows] of Object.entries(SEED)) {
    if (!rows.length) continue;
    const Model = getModel(table);
    const count = await Model.countDocuments();
    if (count === 0) {
      await Model.insertMany(rows);
      const maxId = Math.max(...rows.map(r => r.id));
      await Counter.findByIdAndUpdate(table, { seq: maxId }, { upsert: true });
    } else {
      // Migrate: add any fields present in seed but missing from existing records
      for (const row of rows) {
        const existing = await Model.findOne({ id: row.id }).lean();
        if (!existing) continue;
        const missing = {};
        for (const [k, v] of Object.entries(row)) {
          if (k !== 'id' && existing[k] === undefined) missing[k] = v;
        }
        if (Object.keys(missing).length) {
          await Model.updateOne({ id: row.id }, { $set: missing });
        }
      }
    }
  }
}

async function connect() {
  await mongoose.connect(process.env.MONGO_URI);
  // Drop any unique indexes on fields we don't control (e.g. email_1 left by other apps)
  const problematic = { retailers: ['email_1'], distributors: ['email_1'] };
  for (const [col, idxNames] of Object.entries(problematic)) {
    try {
      const coll = mongoose.connection.collection(col);
      for (const idx of idxNames) {
        await coll.dropIndex(idx).catch(() => {});
      }
    } catch (_) {}
  }
  await seedIfEmpty();
  console.log('MongoDB connected and seeded');
}

module.exports = { connect, findAll, findById, insert, update, updateWhere, remove };
