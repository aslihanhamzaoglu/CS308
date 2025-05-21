const db = require('../config/database');

class RateService {
    static async createRate(user_id, product_id, rate) {
        const query = `
            INSERT INTO rate (user_id, product_id, rate)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE rate = VALUES(rate)
        `;
        const [result] = await db.execute(query, [user_id, product_id, rate]);
        return { user_id, product_id, rate };
    }

    static async deleteRatingByUserId(user_id, product_id) {
        const query = 'DELETE FROM rate WHERE user_id = ? AND product_id = ?';
        const [result] = await db.execute(query, [user_id, product_id]);
        return { affectedRows: result.affectedRows };
    }    

    static async getRatingsByProductId(product_id) {
        const query = 'SELECT user_id, rate FROM rate WHERE product_id = ?';
        const [rows] = await db.execute(query, [product_id]);
        return rows;
    }

    static async getRatesByUser(user_id) {
        const query = 'SELECT product_id, rate FROM rate WHERE user_id = ?';
        const [rows] = await db.execute(query, [user_id]);
        return rows; // returns an array of { product_id, rate }
    }

    static async calculatePopularity(product_id) {
        // 1. Get new average rating
        const [ratingRows] = await db.execute(
            'SELECT AVG(rate) AS avg_rating FROM rate WHERE product_id = ?',
            [product_id]
        );
        const avgRating = ratingRows[0]?.avg_rating || 0;

        // 2. Get sale_count of this product
        const [saleRows] = await db.execute(
            'SELECT sale_count FROM products WHERE id = ?',
            [product_id]
        );
        const saleCount = saleRows[0]?.sale_count || 0;

        // 3. Get total sale counts of all products
        const [totalSaleRows] = await db.execute(
            'SELECT SUM(sale_count) AS total_sales FROM products'
        );
        const totalSales = totalSaleRows[0]?.total_sales || 1; // prevent divide by 0

        // 4. Calculate new popularity
        const normalizedSaleScore = (saleCount / totalSales) * 5; // scale to 5
        const popularity = ((0.3 * avgRating) + (0.7 * normalizedSaleScore)) * 20;

        return popularity;
    }

    static async updateProductPopularity(product_id) {
        const popularity = await this.calculatePopularity(product_id);
        const updateQuery = 'UPDATE products SET popularity = ? WHERE id = ?';
        await db.execute(updateQuery, [popularity, product_id]);
    }

}

module.exports = RateService;
