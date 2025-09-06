const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stockAvailability: {
    type: String,
    required: true,
    enum: ['In stock', 'Out of stock'],
    default: 'In stock'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  bookDetailPageUrl: {
    type: String,
    required: true
  },
  thumbnailImageUrl: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true,
    index: true
  },
  author: {
    type: String,
    trim: true,
    index: true
  },
  isbn: {
    type: String,
    trim: true,
    sparse: true
  },
  scrapedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ price: 1, rating: -1 });
bookSchema.index({ category: 1, stockAvailability: 1 });

bookSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

bookSchema.methods.isAvailable = function() {
  return this.stockAvailability === 'In stock';
};

bookSchema.methods.toPublicJSON = function() {
  const book = this.toObject();
  delete book.__v;
  return book;
};

bookSchema.statics.findByCategory = function(category) {
  return this.find({ category: new RegExp(category, 'i') });
};

bookSchema.statics.findInStock = function() {
  return this.find({ stockAvailability: 'In stock' });
};

bookSchema.statics.findByRating = function(minRating) {
  return this.find({ rating: { $gte: minRating } });
};

module.exports = mongoose.model('Book', bookSchema);