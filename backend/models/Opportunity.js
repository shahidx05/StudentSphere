const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ['internship', 'scholarship', 'hackathon', 'job', 'competition'],
      required: true,
    },
    organization: { type: String, required: true, trim: true },
    applyLink: { type: String },
    startDate: { type: Date },
    lastDate: { type: Date, required: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

opportunitySchema.index({ title: 'text', description: 'text', organization: 'text', tags: 'text' });
opportunitySchema.index({ lastDate: 1 });

module.exports = mongoose.model('Opportunity', opportunitySchema);
