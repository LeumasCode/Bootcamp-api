const mongoose = require('mongoose');
const validator = require('validator');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

const bootcampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      unique: true,
      trim: true,
      maxlength: [50, 'name cannot be more than 50 characters'],
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'name cannot be more than 500 characters'],
    },
    website: {
      type: String,
      validate: [validator.isURL, 'Please provide a valid url'],
    },
    phone: {
      type: String,
      maxlength: [20, 'Phone number cannot be more than 20 characters'],
    },
    email: {
      type: String,
      validate: [validator.isEmail, 'Please Provide a valid email'],
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
    },
    location: {
      //GeoJSON Point
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },
    careers: {
      // Array of Strings
      type: [String],
      required: true,
      enum: [
        'Web Development',
        'Mobile Development',
        'UI/UX',
        'Data Science',
        'Business',
        'other',
      ],
      lowercase: true,
    },
    averageRating: {
      type: Number,
      min: [1, 'rating must  be at least 1'],
      max: [10, 'rating must not be more than 10'],
    },
    averageCost: Number,
    photo: {
      type: String,
      default: 'no-photo.jpg',
    },
    housing: {
      type: Boolean,
      default: false,
    },
    jobAssistance: {
      type: Boolean,
      default: false,
    },
    acceptGi: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Cascade delete courses when a bootcamp is deleted
bootcampSchema.pre('remove', async function (next) {
  console.log(`Courses being removed from bootcamp ${this._id}`);
  await this.model('Course').deleteMany({ bootcamp: this._id });
  next();
});

// Reverse populate with virtuals
bootcampSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false,
});

// A pre-save middleware to create the slug field
bootcampSchema.pre('save', function (next) {
  this.slug = slugify(this.name, {
    replacement: '-',
    lower: true,
  });
  next();
});

// GeoCode & create location field
bootcampSchema.pre('save', async function (next) {
  const loc = await geocoder.geocode(this.address);
  console.log(loc);
  this.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode,
  };

  // Do Not save address in DB
  this.address = undefined;
  next();
});

const Bootcamp = mongoose.model('Bootcamp', bootcampSchema);

module.exports = Bootcamp;
