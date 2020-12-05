const mongoose = require('mongoose');
const validator = require('validator');

const reviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a review title'],
    maxlength: 100,
  },
  text: {
    type: String,
    required: [true, 'Please add some text'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Please add a rating between 1 and 10'],
  },

  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent user from submitting more than one review per bootcamp
reviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

//Statics Method to get avg rating and save
reviewSchema.statics.getAverageRating = async function (bootcampId) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: '$bootcamp',
        nRating: { $sum: 1 },
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  try {
    if (obj.length > 0) {
      await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
        averageRating: obj[0].averageRating,
      });
    } else {
      await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
        averageRating: 4.5,
      });
    }
  } catch (error) {
    console.error(error);
  }
};

// Call getAverageCost after 'save'
reviewSchema.post('save', function () {
  this.constructor.getAverageRating(this.bootcamp);
});

// Call getAverageCost before 'remove'
reviewSchema.pre('remove', function () {
  this.constructor.getAverageRating(this.bootcamp);
});

const Review = mongoose.model('Review ', reviewSchema);

module.exports = Review;
