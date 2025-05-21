const express = require('express');
const router = express.Router();
const RateController = require('../controllers/RateController');

router.post('/rate', RateController.postRate);
router.post('/getall', RateController.getRatingsByProductId);
router.post('/delete', RateController.deleteRatingByUserId);
router.post('/getRatesByUser', RateController.getRatesByUser);

module.exports = router;
