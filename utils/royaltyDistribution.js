const { UserModel } = require("../models/user.model");
const { RoyaltyPool, RoyaltyIncome } = require("../models/royalty.model");
const { IncomeModel } = require("../models/income.model");

// Check if user has completed 3 levels in 2 matrix (binary structure)
async function isUserQualifiedForRoyalty(userId) {
  try {
    const user = await UserModel.findById(userId);
    if (!user) return false;

    // Check if user has left and right children (level 1)
    if (!user.leftChild || !user.rightChild) return false;

    // Check level 2 - both children should have at least one child each
    const leftChild = await UserModel.findById(user.leftChild);
    const rightChild = await UserModel.findById(user.rightChild);
    
    if (!leftChild || !rightChild) return false;
    if (!leftChild.leftChild && !leftChild.rightChild) return false;
    if (!rightChild.leftChild && !rightChild.rightChild) return false;

    // Check level 3 - at least one grandchild should have a child
    const level2Children = [
      leftChild.leftChild,
      leftChild.rightChild,
      rightChild.leftChild,
      rightChild.rightChild
    ].filter(Boolean);

    for (const childId of level2Children) {
      const child = await UserModel.findById(childId);
      if (child && (child.leftChild || child.rightChild)) {
        return true; // Found at least one level 3 completion
      }
    }

    return false;
  } catch (err) {
    console.error("Error checking royalty qualification:", err);
    return false;
  }
}

// Distribute royalty pool at end of month
async function distributeMonthlyRoyalty(month) {
  try {
    // Get royalty pool for the month
    const royaltyPool = await RoyaltyPool.findOne({ month, distributed: false });
    
    if (!royaltyPool || royaltyPool.totalAmount === 0) {
      console.log(`No royalty pool found for ${month} or pool is empty`);
      return;
    }

    // Get all active users
    const users = await UserModel.find({ 'active.isActive': true });
    
    // Filter qualified users
    const qualifiedUsers = [];
    for (const user of users) {
      const isQualified = await isUserQualifiedForRoyalty(user._id);
      if (isQualified) {
        qualifiedUsers.push(user);
      }
    }

    if (qualifiedUsers.length === 0) {
      console.log(`No qualified users for royalty distribution in ${month}`);
      return;
    }

    // Calculate equal share per user
    const sharePerUser = royaltyPool.totalAmount / qualifiedUsers.length;

    // Distribute to each qualified user
    for (const user of qualifiedUsers) {
      // Check if already distributed to prevent duplicate
      const existingRoyalty = await RoyaltyIncome.findOne({
        user: user._id,
        month: month
      });

      if (!existingRoyalty) {
        // Create royalty income entry
        await RoyaltyIncome.create({
          user: user._id,
          amount: sharePerUser,
          month: month,
          status: 'Completed'
        });

        // Add to user's income
        const incomeDetails = await IncomeModel.findById(user.incomeDetails);
        if (incomeDetails) {
          incomeDetails.income.currentIncome += sharePerUser;
          incomeDetails.income.totalIncome += sharePerUser;
          await incomeDetails.save();
        }
      }
    }

    // Mark pool as distributed
    royaltyPool.distributed = true;
    royaltyPool.distributedAt = new Date();
    await royaltyPool.save();

    console.log(`✅ Royalty distributed for ${month}: ${qualifiedUsers.length} users, $${sharePerUser.toFixed(2)} each`);
  } catch (err) {
    console.error("Error distributing monthly royalty:", err);
  }
}

// Process royalty distribution for previous month (run on 1st of each month)
async function processMonthlyRoyaltyDistribution() {
  try {
    // Get previous month
    const now = new Date();
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const month = previousMonth.toISOString().slice(0, 7); // Format: "YYYY-MM"

    console.log(`Processing royalty distribution for ${month}...`);
    await distributeMonthlyRoyalty(month);
    console.log(`Royalty distribution completed for ${month}`);
  } catch (err) {
    console.error("Error in monthly royalty distribution:", err);
  }
}

module.exports = {
  isUserQualifiedForRoyalty,
  distributeMonthlyRoyalty,
  processMonthlyRoyaltyDistribution
};
