const router = require('express').Router();
const RoyaltyController = require('../controllers/royalty.controller');
const { isLoggedIn, isAdminLoggedIn } = require('../middleware/authenticate.middleware');

router.get('/get-royalty-income', isLoggedIn, RoyaltyController.getRoyaltyIncome);
router.get('/get-royalty-pool-status', isLoggedIn, RoyaltyController.getRoyaltyPoolStatus);
router.get('/get-all-royalty-pools', isAdminLoggedIn, RoyaltyController.getAllRoyaltyPools);

module.exports = router;
