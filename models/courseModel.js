const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a course title'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  weeks: {
    type: String,
    required: [true, 'Please add number of weeks'],
  },
  tuition: {
    type: Number,
    required: [true, 'Please add a tuition cost'],
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add a tuition cost'],
    enum: ['beginner', 'intermediate', 'advance'],
  },
  scholarshipsAvailable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
});

// Static function to get average of course tuition fees
courseSchema.statics.getAverageCost = async function (bootcampId) {
  console.log('Calculating average Cost...'.blue);

  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: '$bootcamp',
        averageCost: { $avg: '$tuition' },
      },
    },
  ]);

  console.log(obj);
  try {
    await this.model('Bootcamp').findByIdAndUpdate(
      bootcampId,
      {
        averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
      },
      { new: true }
    );
  } catch (error) {
    console.error(error);
  } 
};

// Call getAverageCost after 'save'
courseSchema.post('save', function () {
  this.constructor.getAverageCost(this.bootcamp);
});

// Call getAverageCost before 'remove'
courseSchema.pre('remove', function () {
  this.constructor.getAverageCost(this.bootcamp);
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
