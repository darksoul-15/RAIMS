const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: ['Administrator', 'ResourceManager', 'ProjectLead', 'Researcher'],
      default: 'Researcher'
    },
    borrowerId: {
      type: String,
      unique: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    phone: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

// Index for role-based lookups (e.g. notify all Admin+RM)
userSchema.index({ role: 1 });

// Auto-generate a sequential borrowerId (BRW-0001) before first save
userSchema.pre('save', async function (next) {
  if (this.borrowerId) return next();
  const count = await mongoose.model('User').countDocuments();
  this.borrowerId = `BRW-${String(count + 1).padStart(4, '0')}`;
  next();
});

// Hash a plaintext password and store on passwordHash
userSchema.methods.setPassword = async function (plainPassword) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(plainPassword, salt);
};

// Compare a candidate password against the stored hash
userSchema.methods.matchPassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
