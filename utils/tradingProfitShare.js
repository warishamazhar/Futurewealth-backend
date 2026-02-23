const { UserModel } = require("../models/user.model");
const { CommissionIncome } = require("../models/commission.model");
const { IncomeModel } = require("../models/income.model");
const { generateCustomId } = require("./generator.uniqueid");
const { TRADING_PROFIT_SHARE } = require("./compensation.config");

/**
 * TRADING PROFIT SHARE LEVEL BONUS
 * 
 * Distributes trading profit across 25 levels with specific percentages.
 * All values defined in compensation.config.js
 * 
 * Logic:
 * 1. Deduct gas/company fee percentage first
 * 2. Distribute remaining amount across levels using configured percentages
 * 3. Prevent duplicate distribution (checks within last minute)
 * 4. Max depth from config
 */
async function distributeTradingProfitShare(tradingProfitAmount, sourceUserId) {
  try {
    // Deduct gas/company fee first
    const gasFee = tradingProfitAmount * (TRADING_PROFIT_SHARE.gasFeePercentage / 100);
    const distributableAmount = tradingProfitAmount * (TRADING_PROFIT_SHARE.distributablePercentage / 100);

    const sourceUser = await UserModel.findById(sourceUserId);
    if (!sourceUser || !sourceUser.sponsor) return;

    let currentUser = await UserModel.findById(sourceUser.sponsor);
    let level = 0;

    while (currentUser && level < TRADING_PROFIT_SHARE.maxLevels) {
      const percentage = TRADING_PROFIT_SHARE.levelPercentages[level];
      if (!percentage) break;

      // Calculate share for this level
      const shareAmount = distributableAmount * percentage;

      // Check for duplicate distribution (within last minute)
      const existingShare = await CommissionIncome.findOne({
        user: currentUser._id,
        fromUser: sourceUserId,
        type: "TRADING_PROFIT_SHARE",
        amount: tradingProfitAmount,
        level: level + 1,
        createdAt: { $gte: new Date(Date.now() - 60000) }
      });

      if (!existingShare) {
        const bonusId = generateCustomId({ prefix: "YMK-TPS", min: 14, max: 14 });
        
        // Create commission income entry
        const tradingProfitShare = new CommissionIncome({
          id: bonusId,
          user: currentUser._id,
          fromUser: sourceUserId,
          amount: tradingProfitAmount,
          income: shareAmount,
          percentage: percentage * 100,
          level: level + 1,
          type: "TRADING_PROFIT_SHARE",
          status: "Completed"
        });

        // Update income details
        const incomeDetails = await IncomeModel.findById(currentUser.incomeDetails);
        if (incomeDetails) {
          incomeDetails.income.currentIncome += shareAmount;
          incomeDetails.income.totalIncome += shareAmount;
          incomeDetails.tradingProfitShare.income += shareAmount;
          incomeDetails.tradingProfitShare.history.push(tradingProfitShare._id);
          
          await tradingProfitShare.save();
          await incomeDetails.save();
        }
      }

      // Move to next level
      if (currentUser.sponsor) {
        currentUser = await UserModel.findById(currentUser.sponsor);
        level++;
      } else {
        break;
      }
    }

    console.log(`✅ Trading Profit Share distributed: $${tradingProfitAmount} (Gas: $${gasFee}, Distributed: $${distributableAmount})`);
  } catch (err) {
    console.error("Error distributing Trading Profit Share:", err);
  }
}

module.exports = { distributeTradingProfitShare };
