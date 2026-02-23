const { UserModel } = require("../models/user.model");
const { MatchingPairModel } = require("../models/matchingpair.model");
const { checkRankAchievements } = require("./rankReward");


async function calculateMatchingBonus(newUserId, commissionPercentage = 10) {
  try {
    const newUser = await UserModel.findById(newUserId).populate('sponsor');
    if (!newUser) throw new Error("New user not found");

    let currentUser = newUser.sponsor;
    const investmentAmount = newUser.investment || 0;

    let level = 1;
    while (currentUser && level <= 10) {
      const leftChild = await UserModel.findById(currentUser.leftChild);
      const rightChild = await UserModel.findById(currentUser.rightChild);

      if (leftChild && rightChild) {
        // Check if pair already exists
        const existingPair = await MatchingPairModel.findOne({
          user: currentUser._id,
          left: leftChild._id,
          right: rightChild._id,
        });

        if (!existingPair) {
          // Calculate commission
          const commission = (investmentAmount * commissionPercentage) / 100;

          // Check if this user should be excluded from first 2 directs
          const partners = await UserModel.find({ sponsor: currentUser.sponsor }).sort({ createdAt: 1 });
          const isInFirstTwo = partners.slice(0, 2).some(p => p._id.toString() === currentUser._id.toString());
          
          // Create new matching pair
          await MatchingPairModel.create({
            user: currentUser._id,
            left: leftChild._id,
            right: rightChild._id,
            commition: commission,
            bonusType: isInFirstTwo ? 'MATCHING_BONUS' : 'FUTURE_WEALTH_CREATION_BONUS'
          });

          // Update currentUser's wallet/ledger if needed
          currentUser.investment = (currentUser.investment || 0) + commission;
          await currentUser.save();
          
          // Check rank achievements after new pair is created
          await checkRankAchievements(currentUser._id);
        }
      }

      // Move up the tree
      currentUser = await UserModel.findById(currentUser.sponsor);
      level++;
    }
  } catch (err) {
    console.error("Error calculating matching bonus:", err);
    throw err;
  }
}

module.exports = { calculateMatchingBonus };
