import mongoose from 'mongoose';
import logger from './logger';
import { getUserContext } from '../middlewares/userContext.middleware';
const mongoosePaginate = require('mongoose-paginate-v2');
// use plugin before initializing all model before router import

// mongoose.set('debug', true);

mongoose.plugin((schema) => {
  schema.plugin(mongoosePaginate);
});

mongoose.plugin(function (schema) {
  schema.add({
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    deletedAt: {
      type: Date,
      default: null
    },
    blockedAt: {
      type: Date,
      default: null
    }
  });

  schema.statics.softDelete = function (query) {
    if (typeof query === 'string') {
      query = { _id: query };
    }
    return this.updateOne(query, { deletedAt: new Date() });
  };

  schema.statics.block = function (query) {
    if (typeof query === 'string') {
      query = { _id: query };
    }
    return this.updateOne(query, { blockedAt: new Date() });
  };

  schema.pre('save', async function (next) {
    console.log('SAVE');
    if (getUserContext()?._id) {
      if (this.isNew) {
        this.createdBy = await getUserContext()?._id;
      }
      this.updatedBy = await getUserContext()?._id;
    }
    next();
  });

  schema.pre('updateOne', async function (next) {
    if (getUserContext()?._id) {
      this._update.updatedBy = await getUserContext()?._id;
    }
    next();
  });

  schema.pre('updateMany', async function (next) {
    if (getUserContext()?._id) {
      this._update.updatedBy = await getUserContext()?._id;
    }
    next();
  });

  schema.pre('findOneAndUpdate', async function (next) {
    if (getUserContext()?._id) {
      this._update.updatedBy = await getUserContext()?._id;
    }
    next();
  });

  schema.pre('update', async function (next) {
    if (getUserContext()?._id) {
      this._update.updatedBy = await getUserContext()?._id;
    }
    next();
  });

  schema.pre('aggregate', async function (next) {
    // filter out soft deleted records
    this.pipeline().unshift({ $match: { deletedAt: null } });
    next();
  });

  schema.pre('countDocuments', async function (next) {
    // filter out soft deleted records
    this._conditions.deletedAt = null;
    next();
  });

  schema.pre(/^find/, function () {
    this.where({ deletedAt: null });
  });
});

const database = async () => {
  try {
    // Replace database value in the .env file with your database config url
    const DATABASE =
      process.env.NODE_ENV === 'test'
        ? process.env.DATABASE_TEST
        : process.env.DATABASE;

    await mongoose.connect(DATABASE, {
      useFindAndModify: false,
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logger.info('Connected to the database.');
  } catch (error) {
    logger.error('Could not connect to the database.', error);
  }
};
export default database;
