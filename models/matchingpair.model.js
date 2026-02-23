const mongoose = require('mongoose');

const matchingPairSchema = new mongoose.Schema({
    left: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true,
    },
    right: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true,
    },
    commition:{
        type:Number,
        default:0
    },
    checked: {
        type: Boolean,
        default: false,
    },
    bonusType: {
        type: String,
        enum: ['MATCHING_BONUS', 'POWER_INFINITY_BONUS', 'FUTURE_WEALTH_CREATION_BONUS'],
        default: 'MATCHING_BONUS'
    },
}, { timestamps: true, versionKey: false });

exports.MatchingPairModel = mongoose.model('Matching', matchingPairSchema);
