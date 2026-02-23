const { UserModel } = require("../models/user.model");
const { RankAchievement } = require("../models/rankAchievement.model");
const { MatchingPairModel } = require("../models/matchingpair.model");
const { CommissionIncome } = require("../models/commission.model");
const { IncomeModel } = require("../models/income.model");
const { generateCustomId } = require("./generator.uniqueid");
const { RANK_REWARDS, RANK_REWARD_RELEASE_DAYS } = require("./compensation.config");

/**
 * RANK REWARD SYSTEM
 * 
 * Tracks user rank achievements based on matching pairs.
 * All rank definitions and release days defined in compensation.config.js
 * 
 * Logic:
 * - Check user's total matching pairs
 * - Record achievement when threshold reached
 * - Release reward after configured days (30 days)
 * - Prevent duplicate achievements (unique index)
 */

// Check and record rank achievements for a user
async function checkRankAchievements(userId) {
  try {
    const user = await UserModel.findById(userId);
    if (!user) return;

    // Count total matching pairs for the user
    const totalPairs = await MatchingPairModel.countDocuments({ user: userId });

    // Check each rank from config
    for (const rank of RANK_REWARDS) {
      if (totalPairs >= rank.pairs) {
        // Check if already achieved
        const existingAchievement = await RankAchievement.findOne({
          user: userId,
          rank: rank.name
        });

        if (!existingAchievement) {
          // Record new achievement
          const achievedDate = new Date();
          const releaseDate = new Date(achievedDate);
          releaseDate.setDate(releaseDate.getDate() + RANK_REWARD_RELEASE_DAYS);

          await RankAchievement.create({
            user: userId,
            rank: rank.name,
            pairsRequired: rank.pairs,
            pairsAchieved: totalPairs,
            rewardAmount: rank.reward,
            achievedDate: achievedDate,
            releaseDate: releaseDate,
            claimed: false
          });

          console.log(`✅ Rank achieved: ${rank.name} for user ${userId}`);
        }
      }
    }
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key error - achievement already exists
      return;
    }
    console.error("Error checking rank achievements:", err);
  }
}

// Process and release rewards that are due (configured days passed)
async function processRankRewardReleases() {
  try {
    const now = new Date();
    
    // Find all achievements that are due for release and not yet claimed
    const dueAchievements = await RankAchievement.find({
      releaseDate: { $lte: now },
      claimed: false
    });

    for (const achievement of dueAchievements) {
      const bonusId = generateCustomId({ prefix: "YMK-RNK", min: 14, max: 14 });

      // Create commission income entry
      const rankReward = new CommissionIncome({
        id: bonusId,
        user: achievement.user,
        income: achievement.rewardAmount,
        type: "Rank Reward",
        status: "Completed"
      });

      // Update income details
      const incomeDetails = await IncomeModel.findOne({ user: achievement.user });
      if (incomeDetails) {
        incomeDetails.income.currentIncome += achievement.rewardAmount;
        incomeDetails.income.totalIncome += achievement.rewardAmount;
        incomeDetails.rankRewardIncome.income += achievement.rewardAmount;
        incomeDetails.rankRewardIncome.history.push(rankReward._id);
        
        await rankReward.save();
        await incomeDetails.save();

        // Mark as claimed
        achievement.claimed = true;
        achievement.claimedDate = now;
        await achievement.save();

        console.log(`✅ Rank reward released: ${achievement.rank} - $${achievement.rewardAmount} for user ${achievement.user}`);
      }
    }

    if (dueAchievements.length > 0) {
      console.log(`Processed ${dueAchievements.length} rank reward releases`);
    }
  } catch (err) {
    console.error("Error processing rank reward releases:", err);
  }
}

// Get user's rank achievements
async function getUserRankAchievements(userId) {
  try {
    const achievements = await RankAchievement.find({ user: userId }).sort({ achievedDate: -1 });
    const totalPairs = await MatchingPairModel.countDocuments({ user: userId });

    // Determine current rank
    let currentRank = null;
    for (let i = RANK_REWARDS.length - 1; i >= 0; i--) {
      if (totalPairs >= RANK_REWARDS[i].pairs) {
        currentRank = RANK_REWARDS[i];
        break;
      }
    }

    // Determine next rank
    let nextRank = null;
    for (const rank of RANK_REWARDS) {
      if (totalPairs < rank.pairs) {
        nextRank = rank;
        break;
      }
    }

    return {
      totalPairs,
      currentRank,
      nextRank,
      achievements
    };
  } catch (err) {
    console.error("Error getting user rank achievements:", err);
    return null;
  }
}

module.exports = {
  checkRankAchievements,
  processRankRewardReleases,
  getUserRankAchievements,
  RANKS: RANK_REWARDS // Export for backward compatibility
};
