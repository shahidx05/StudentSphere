const mongoose = require('mongoose');

const resourceItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: {
      type: String,
      enum: ['notes', 'pyq', 'department_notes', 'gate', 'course_resource', 'learning_path'],
      required: true,
    },
    subject: { type: String, trim: true },
    department: { type: String, trim: true },
    year: { type: Number, min: 1, max: 6 },
    fileUrl: { type: String },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: String, trim: true }],
    downloadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text index for search
resourceItemSchema.index({ title: 'text', description: 'text', subject: 'text', tags: 'text' });

module.exports = mongoose.model('ResourceItem', resourceItemSchema);
