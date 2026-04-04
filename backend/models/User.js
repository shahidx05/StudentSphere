const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    department: { type: String, trim: true },
    branch: { type: String, trim: true },
    year: { type: Number, min: 1, max: 6 },
    state: { type: String, trim: true },
    district: { type: String, trim: true },
    skills: [{ type: String, trim: true }],
    profilePhoto: { type: String, default: '' },
    bio: { type: String, maxlength: 500, default: '' },
    connections: [connectionSchema],
    savedResources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ResourceItem' }],
    savedOpportunities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity' }],
    notifications: [
      {
        message: String,
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
