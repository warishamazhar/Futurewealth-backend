require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const dns = require('dns');

// Set DNS servers to reliable ones
dns.setServers([
  "8.8.8.8",
  "8.8.4.4",
  "1.1.1.1",
  "1.0.0.1"
]);

const { UserModel } = require('../models/user.model');
const { TransactionModel } = require('../models/transaction.model');
const { IncomeModel } = require('../models/income.model');
const connectDB = require('../utils/config.db');

async function deleteRidhamJainData() {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();
    
    // Find user by username (case-insensitive)
    const username = 'Ridham jain';
    console.log(`\n🔍 Searching for user with username: "${username}"...`);
    
    const user = await UserModel.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') } 
    });
    
    if (!user) {
      console.log(`❌ No user found with username "${username}"`);
      await mongoose.connection.close();
      process.exit(0);
    }
    
    console.log(`✅ Found user: ${user.username} (ID: ${user._id})`);
    console.log(`   Email: ${user.email || 'N/A'}`);
    console.log(`   Mobile: ${user.mobile || 'N/A'}`);
    
    // Delete all transactions for this user
    console.log('\n🗑️  Deleting transactions...');
    const transactionResult = await TransactionModel.deleteMany({ user: user._id });
    console.log(`   ✅ Deleted ${transactionResult.deletedCount} transaction(s)`);
    
    // Delete all income records for this user
    console.log('\n🗑️  Deleting income records...');
    const incomeResult = await IncomeModel.deleteMany({ user: user._id });
    console.log(`   ✅ Deleted ${incomeResult.deletedCount} income record(s)`);
    
    // Delete the user itself
    console.log('\n🗑️  Deleting user...');
    await UserModel.findByIdAndDelete(user._id);
    console.log(`   ✅ User deleted successfully`);
    
    console.log('\n✅ All data for "Ridham jain" has been deleted successfully!');
    console.log('\nSummary:');
    console.log(`   - Transactions deleted: ${transactionResult.deletedCount}`);
    console.log(`   - Income records deleted: ${incomeResult.deletedCount}`);
    console.log(`   - User deleted: 1`);
    
  } catch (error) {
    console.error('❌ Error deleting data:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the script
deleteRidhamJainData();





