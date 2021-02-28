//const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');

/**
 * item Schema
 */
const ItemSchema = new mongoose.Schema({
    itemNumber: {
        type: String,
        required: true
    },
    itemName: {
        type: String,
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    orderNumber: {
        type: String,
        required: true
    },
    storeCode:{
        type: String
    },
    note: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
ItemSchema.method({
});

/**
 * Statics
 */
ItemSchema.statics = {
    /**
     * Get user
     * @param {ObjectId} id - The objectId of user.
     * @returns {Promise<User, APIError>}
     */
    get(id) {
        return this.findById(id)
            .exec()
            .then((order) => {
                if (order) {
                    return order;
                }
                const err = new APIError('No such order exists!', httpStatus.NOT_FOUND);
                return Promise.reject(err);
            });
    },

    /**
     * List orders in descending order of 'createdAt' timestamp.
     * @param {number} skip - Number of users to be skipped.
     * @param {number} limit - Limit number of users to be returned.
     * @returns {Promise<User[]>}
     */
    list({ skip = 0, limit = 50 } = {}) {
        return this.find()
            .sort({ createdAt: -1 })
            .skip(+skip)
            .limit(+limit)
            .exec();
    }
};

/**
 * @typedef Order
 */
module.exports = mongoose.model('Item', ItemSchema);