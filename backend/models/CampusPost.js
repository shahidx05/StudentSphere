const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

const campusPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ['announcement', 'event', 'recruitment', 'general'],
      required: true,
    },
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club' },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    images: [{ type: String }],
    eventDate: { type: Date },
    eventVenue: { type: String, trim: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
  },
  { timestamps: true }
);

campusPostSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('CampusPost', campusPostSchema);
