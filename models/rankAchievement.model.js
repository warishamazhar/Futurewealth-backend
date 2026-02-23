const mongoose = require('mongoose');

const rankAchievementSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rank: {
        type: String,
        required: true,
        enum: [
            'Star', '1 Star', '2 Star', '3 Star', '4 Star', '5 Star',
            'Silver', 'Gold', 'Platinum', 'Diamond', 'Blue Diamond',
            'Royal Diamond', 'Crown Diamond', 'Ambassador',
            'Royal Ambassador', 'Crown Ambassador'
        ]
    },
    pairsRequired: {
        type: Number,
        required: true
    },
    pairsAchieved: {
        type: Number,
        required: true
    },
    rewardAmount: {
        type: Number,
        required: true
    },
    achievedDate: {
        type: Date,
        required: true
    },
    releaseDate: {
        type: Date,
        required: true // achievedDate + 30 days
    },
    claimed: {
        type: Boolean,
        default: false
    },
    claimedDate: {
        type: Date,
        default: null
    }
}, { timestamps: true, versionKey: false });

// Compound index to prevent duplicate rank achievements
rankAchievementSchema.index({ user: 1, rank: 1 }, { unique: true });

exports.RankAchievement = mongoose.model('RankAchievement', rankAchievementSchema);
