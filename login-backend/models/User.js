const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true },
  role:      { type: String, enum: ['dist', 'ret', 'hosp', 'mfr'], default: 'dist' },
}, { timestamps: true });

// Keep the same interface so controllers don't change
userSchema.methods.toSafe = function () {
  const { password, __v, ...rest } = this.toObject();
  return rest;
};

module.exports = mongoose.model('User', userSchema);
