const { UserModel } = require("../models/user.model");
const { MatchingPairModel } = require("../models/matchingpair.model");
const { CommissionIncome } = require("../models/commission.model");
const { IncomeModel } = require("../models/income.model");
const { generateCustomId } = require("./generator.uniqueid");
const { MATCHING_BONUSES } = require("./compensation.config");

/**
 * POWER INFINITY BONUS
 * 
 * Distributes bonus when user completes 2-level matrix (binary structure).
 * Amount per pair and minimum partners required defined in compensation.config.js
 * 
 * Logic:
 * - User must have left AND right children (2-level matrix)
 * - Must have more than configured minimum partners (excludes first 2 directs)
 * - Credits configured amount per valid matching pair
 * - Prevents duplicate by checking existing pairs
 */
async function calculatePowerInfinityBonus(newUserId) {
  try {
    const newUser = await UserModel.findById(newUserId).populate('sponsor');
    if (!newUser || !newUser.sponsor) return;

    let currentUser = newUser.sponsor;
    
    while (currentUser) {
      const leftChild = await UserModel.findById(currentUser.leftChild);
      const rightChild = await UserModel.findById(currentUser.rightChild);

      if (leftChild && rightChild) {
        // Get all direct partners sorted by creation date
        const partners = await UserModel.find({ sponsor: currentUser._id }).sort({ createdAt: 1 });
        
        // Only proceed if user has more than minimum required partners
        if (partners.length > MATCHING_BONUSES.powerInfinity.minPartnersRequired) {
          // Check if this specific pair already exists for Power Infinity Bonus
          const existingPair = await MatchingPairModel.findOne({
            user: currentUser._id,
            left: leftChild._id,
            right: rightChild._id,
            bonusType: 'POWER_INFINITY_BONUS'
          });

          if (!existingPair) {
            const bonusId = generateCustomId({ prefix: "YMK-PIB", min: 14, max: 14 });
            
            // Create matching pair record
            await MatchingPairModel.create({
              user: currentUser._id,
              left: leftChild._id,
              right: rightChild._id,
              commition: MATCHING_BONUSES.powerInfinity.amount,
              bonusType: 'POWER_INFINITY_BONUS'
            });

            // Create commission income entry
            const powerInfinityBonus = new CommissionIncome({
              id: bonusId,
              user: currentUser._id,
              income: MATCHING_BONUSES.powerInfinity.amount,
              type: "POWER_INFINITY_BONUS",
              status: "Completed"
            });

            // Update income details
            const incomeDetails = await IncomeModel.findById(currentUser.incomeDetails);
            if (incomeDetails) {
              incomeDetails.income.currentIncome += MATCHING_BONUSES.powerInfinity.amount;
              incomeDetails.income.totalIncome += MATCHING_BONUSES.powerInfinity.amount;
              incomeDetails.powerInfinityBonus.income += MATCHING_BONUSES.powerInfinity.amount;
              incomeDetails.powerInfinityBonus.history.push(powerInfinityBonus._id);
              
              await powerInfinityBonus.save();
              await incomeDetails.save();
            }
          }
        }
      }

      currentUser = await UserModel.findById(currentUser.sponsor);
    }
  } catch (err) {
    console.error("Error calculating Power Infinity Bonus:", err);
  }
}

module.exports = { calculatePowerInfinityBonus };
