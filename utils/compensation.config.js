/**
 * MLM Compensation Configuration
 * 
 * This file centralizes all compensation-related values for the MLM system.
 * All bonus calculations, percentages, and monetary values are defined here.
 * 
 * DO NOT hardcode values in individual files - always import from this config.
 */

// ==================== SUBSCRIPTION ====================
const SUBSCRIPTION = {
  price: 110, // USDT
  validityDays: 365
};

// ==================== REFERRAL BONUSES ====================
const REFERRAL_BONUSES = {
  // First Step Bonus: First 2 direct referrals
  firstStep: {
    amount: 20, // USDT per referral
    maxCount: 2 // Only first 2 directs
  },
  
  // Power Bonus: From 3rd direct referral onward
  power: {
    amount: 30, // USDT per referral
    startFrom: 3 // Starts from 3rd direct
  }
};

// ==================== MATCHING BONUSES ====================
const MATCHING_BONUSES = {
  // Power Infinity Bonus: 10 USDT per valid matching pair
  powerInfinity: {
    amount: 10, // USDT per pair
    minPartnersRequired: 3 // Must have more than 2 partners (excludes first 2)
  },
  
  // Future Wealth Creation Bonus: 20 USDT per pair in downline
  futureWealthCreation: {
    amount: 20, // USDT per pair
    excludeFirstDirects: 2 // Exclude first 2 directs from calculation
  }
};

// ==================== WITHDRAWAL FEES ====================
const WITHDRAWAL = {
  gasFeePercentage: 4, // 4% gas fee
  //royaltyPercentage: 10, // 10% royalty deduction
  minAmount: 10, // Minimum withdrawal
  maxAmount: 500 // Maximum withdrawal
};

// ==================== ROYALTY SYSTEM ====================
const ROYALTY = {
  deductionPercentage: 10, // 10% from every withdrawal
  distributionDay: 1, // 1st of each month
  qualificationLevels: 3 // Must complete 3 levels in 2 matrix
};

// ==================== TRADING PROFIT SHARE ====================
const TRADING_PROFIT_SHARE = {
  gasFeePercentage: 30, // 30% gas/company fee
  distributablePercentage: 70, // 70% distributed across levels
  maxLevels: 25,
  
  // Level percentages (of the 70% distributable amount)
  // Total: 100% of distributable = 85% of original amount
  levelPercentages: [
    0.30, // Level 1: 30%
    0.20, // Level 2: 20%
    0.10, // Level 3: 10%
    0.05, // Level 4: 5%
    0.04, // Level 5: 4%
    0.03, // Level 6: 3%
    // Levels 7-15: 2% each (9 levels)
    0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02,
    // Levels 16-25: 1% each (10 levels)
    0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01
  ]
};

// ==================== RANK REWARDS ====================
const RANK_REWARDS = [
  { name: 'Star', pairs: 10, reward: 40 },
  { name: '1 Star', pairs: 35, reward: 100 },
  { name: '2 Star', pairs: 95, reward: 200 },
  { name: '3 Star', pairs: 245, reward: 400 },
  { name: '4 Star', pairs: 595, reward: 750 },
  { name: '5 Star', pairs: 1395, reward: 1400 },
  { name: 'Silver', pairs: 3145, reward: 2700 },
  { name: 'Gold', pairs: 7145, reward: 5500 },
  { name: 'Platinum', pairs: 17145, reward: 10000 },
  { name: 'Diamond', pairs: 42145, reward: 20000 },
  { name: 'Blue Diamond', pairs: 102145, reward: 35000 },
  { name: 'Royal Diamond', pairs: 227145, reward: 70000 },
  { name: 'Crown Diamond', pairs: 487145, reward: 135000 },
  { name: 'Ambassador', pairs: 812145, reward: 270000 },
  { name: 'Royal Ambassador', pairs: 1512145, reward: 500000 },
  { name: 'Crown Ambassador', pairs: 3012145, reward: 1000000 }
];

const RANK_REWARD_RELEASE_DAYS = 30; // Rewards released after 30 days

// ==================== EXPORTS ====================
module.exports = {
  SUBSCRIPTION,
  REFERRAL_BONUSES,
  MATCHING_BONUSES,
  WITHDRAWAL,
  ROYALTY,
  TRADING_PROFIT_SHARE,
  RANK_REWARDS,
  RANK_REWARD_RELEASE_DAYS
};
