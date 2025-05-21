const RateService = require('../services/RateService');
const UserService = require('../services/UserService');


const postRate = async (req, res) => {
    try {
        const { token, product_id, rate } = req.body;
        const user_id = await UserService.getUserIdFromToken(token);

        const validValues = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
        if (!validValues.includes(rate)) {
            return res.status(400).json({ message: "Invalid rating value" });
        }

        // 1. Save the rate
        const savedRate = await RateService.createRate(user_id, product_id, rate);

        // 2. Update product popularity
        await RateService.updateProductPopularity(product_id);

        res.status(201).json({ message: "Rating saved", rate: savedRate });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

const deleteRatingByUserId = async (req, res) => {
    try {
        const { token, product_id } = req.body;

        if (!product_id) {
            return res.status(400).json({ message: "Missing product_id" });
        }

        const user_id = await UserService.getUserIdFromToken(token);

        const result = await RateService.deleteRatingByUserId(user_id, product_id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "No rating found for this user and product" });
        }

        res.status(200).json({ message: "Rating deleted", deletedCount: result.affectedRows });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

const getRatingsByProductId = async (req, res) => {
    try {
        const { product_id } = req.body;
        if (!product_id) {
            return res.status(400).json({ message: "Missing product_id" });
        }

        const ratings = await RateService.getRatingsByProductId(product_id);
        res.status(200).json({ product_id, ratings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getRatesByUser = async (req, res) => {
  try {
    const { token } = req.body;
    const user_id = await UserService.getUserIdFromToken(token);

    if (!user_id) {
      return res.status(400).json({ message: 'Missing user_id' });
    }

    const rates = await RateService.getRatesByUser(user_id);
    res.status(200).json({ rates });
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
    postRate,
    getRatingsByProductId,
    deleteRatingByUserId,
    getRatesByUser
};
