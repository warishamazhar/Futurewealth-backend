const cron = require('node-cron');
const { processRankRewardReleases } = require('../utils/rankReward');

// Run daily at 00:00 to check and release rank rewards
const rankRewardCron = cron.schedule('0 0 * * *', async () => {
  console.log('Starting daily rank reward release processing...');
  try {
    await processRankRewardReleases();
    console.log('Rank reward release processing completed successfully');
  } catch (error) {
    console.error('Error in rank reward cron:', error);
  }
}, {
  scheduled: true,
  timezone: "UTC"
});

module.exports = { rankRewardCron };
