const mongoose = require('mongoose');

const royaltyIncomeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        default: 0
    },
    month: {
        type: String,
        required: true // Format: "YYYY-MM"
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Completed'
    }
}, { timestamps: true, versionKey: false });

const royaltyPoolSchema = new mongoose.Schema({
    month: {
        type: String,
        required: true,
        unique: true // Format: "YYYY-MM"
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    distributed: {
        type: Boolean,
        default: false
    },
    distributedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true, versionKey: false });

exports.RoyaltyIncome = mongoose.model('RoyaltyIncome', royaltyIncomeSchema);
exports.RoyaltyPool = mongoose.model('RoyaltyPool', royaltyPoolSchema);
