const { RoyaltyIncome, RoyaltyPool } = require("../models/royalty.model");
const { isUserQualifiedForRoyalty } = require("../utils/royaltyDistribution");

// Get user's royalty income history
exports.getRoyaltyIncome = async (req, res) => {
  try {
    const history = await RoyaltyIncome.find({ user: req.user._id }).sort({ createdAt: -1 });
    const totalIncome = history.reduce((sum, item) => sum + item.amount, 0);
    
    res.status(200).json({
      success: true,
      message: "Royalty Income Reports",
      data: { history, totalIncome, count: history.length },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get current month royalty pool status
exports.getRoyaltyPoolStatus = async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const royaltyPool = await RoyaltyPool.findOne({ month: currentMonth });
    
    const isQualified = await isUserQualifiedForRoyalty(req.user._id);
    
    res.status(200).json({
      success: true,
      message: "Royalty Pool Status",
      data: {
        month: currentMonth,
        totalAmount: royaltyPool?.totalAmount || 0,
        distributed: royaltyPool?.distributed || false,
        userQualified: isQualified
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get all royalty pools
exports.getAllRoyaltyPools = async (req, res) => {
  try {
    const pools = await RoyaltyPool.find().sort({ month: -1 });
    
    res.status(200).json({
      success: true,
      message: "All Royalty Pools",
      data: pools,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = exports;
