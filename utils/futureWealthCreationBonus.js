const { UserModel } = require("../models/user.model");
const { MatchingPairModel } = require("../models/matchingpair.model");
const { CommissionIncome } = require("../models/commission.model");
const { IncomeModel } = require("../models/income.model");
const { generateCustomId } = require("./generator.uniqueid");

async function calculateFutureWealthCreationBonus(userId) {
  try {
    const user = await UserModel.findById(userId);
    if (!user) return;

    // Check if bonus already generated today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (user.lastFutureWealthBonusDate && user.lastFutureWealthBonusDate >= today) {
      return; // Already processed today
    }

    // Get all direct partners sorted by creation date
    const partners = await UserModel.find({ sponsor: user._id }).sort({ createdAt: 1 });
    
    // Exclude first 2 directs
    const eligiblePartners = partners.slice(2);
    
    if (eligiblePartners.length === 0) return;

    // Get all downline users (excluding first 2 directs)
    const downlineIds = [];
    for (const partner of eligiblePartners) {
      downlineIds.push(partner._id);
      const subDownline = await getDownlineRecursive(partner._id);
      downlineIds.push(...subDownline);
    }

    // Find all matching pairs in downline created today
    const pairCount = await MatchingPairModel.countDocuments({
      user: { $in: downlineIds },
      bonusType: 'FUTURE_WEALTH_CREATION_BONUS',
      createdAt: { $gte: today }
    });

    if (pairCount > 0) {
      const bonusAmount = pairCount * 20;
      const bonusId = generateCustomId({ prefix: "YMK-FWC", min: 14, max: 14 });

      // Create commission income entry
      const futureWealthBonus = new CommissionIncome({
        id: bonusId,
        user: user._id,
        income: bonusAmount,
        type: "FUTURE_WEALTH_CREATION_BONUS",
        status: "Completed"
      });

      // Update income details
      const incomeDetails = await IncomeModel.findById(user.incomeDetails);
      if (incomeDetails) {
        incomeDetails.income.currentIncome += bonusAmount;
        incomeDetails.income.totalIncome += bonusAmount;
        incomeDetails.futureWealthCreationBonus.income += bonusAmount;
        incomeDetails.futureWealthCreationBonus.history.push(futureWealthBonus._id);
        
        await futureWealthBonus.save();
        await incomeDetails.save();
      }

      // Update last bonus date
      user.lastFutureWealthBonusDate = new Date();
      await user.save();
    }
  } catch (err) {
    console.error("Error calculating Future Wealth Creation Bonus:", err);
  }
}

async function getDownlineRecursive(userId) {
  const downline = [];
  const children = await UserModel.find({ sponsor: userId });
  
  for (const child of children) {
    downline.push(child._id);
    const subDownline = await getDownlineRecursive(child._id);
    downline.push(...subDownline);
  }
  
  return downline;
}

// Function to process Future Wealth Creation Bonus for all users (daily cron)
async function processDailyFutureWealthBonus() {
  try {
    const users = await UserModel.find({ 'active.isActive': true });
    
    for (const user of users) {
      await calculateFutureWealthCreationBonus(user._id);
    }
    
    console.log('Daily Future Wealth Creation Bonus processed successfully');
  } catch (err) {
    console.error("Error processing daily Future Wealth Creation Bonus:", err);
  }
}

module.exports = { 
  calculateFutureWealthCreationBonus,
  processDailyFutureWealthBonus
};
