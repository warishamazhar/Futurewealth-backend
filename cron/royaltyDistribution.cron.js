const cron = require('node-cron');
const { processMonthlyRoyaltyDistribution } = require('../utils/royaltyDistribution');

// Run on 1st of every month at 00:00
const royaltyDistributionCron = cron.schedule('0 0 1 * *', async () => {
  console.log('Starting monthly royalty distribution...');
  try {
    await processMonthlyRoyaltyDistribution();
    console.log('Monthly royalty distribution completed successfully');
  } catch (error) {
    console.error('Error in royalty distribution cron:', error);
  }
}, {
  scheduled: true,
  timezone: "UTC"
});

module.exports = { royaltyDistributionCron };
