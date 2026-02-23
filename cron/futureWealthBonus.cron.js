const cron = require('node-cron');
const { processDailyFutureWealthBonus } = require('../utils/futureWealthCreationBonus');

// Run daily at midnight (00:00)
const futureWealthBonusCron = cron.schedule('0 0 * * *', async () => {
  console.log('Starting daily Future Wealth Creation Bonus processing...');
  try {
    await processDailyFutureWealthBonus();
    console.log('Future Wealth Creation Bonus processing completed successfully');
  } catch (error) {
    console.error('Error in Future Wealth Creation Bonus cron:', error);
  }
}, {
  scheduled: true,
  timezone: "UTC"
});

module.exports = { futureWealthBonusCron };
