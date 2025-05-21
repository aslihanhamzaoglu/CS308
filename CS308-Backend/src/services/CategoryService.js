const Category = require('../models/Category');
const db = require('../config/database');

class CategoryService {

  //Get category types
  static async getCategoryTypes() {
    const query = 'SELECT * FROM categories WHERE visible = 1';
    const [categories] = await db.execute(query);
    return categories;
  }

  static async getAllCategories() {
    const query = 'SELECT * FROM categories';
    const [categories] = await db.execute(query);
    return categories;
  }
  
  static async deactivateCategory(categoryId) {
    const queryCategory = 'UPDATE categories SET visible = 0 WHERE id = ?';
    const queryProducts = 'UPDATE products SET visible = 0 WHERE category_id = ?';
  
    await db.execute(queryCategory, [categoryId]);
    await db.execute(queryProducts, [categoryId]);
  
    return true;
  }

  static async activateCategory(categoryId) {
    const queryCategory = 'UPDATE categories SET visible = 1 WHERE id = ?';
    const queryProducts = 'UPDATE products SET visible = 1 WHERE category_id = ?';
  
    await db.execute(queryCategory, [categoryId]);
    await db.execute(queryProducts, [categoryId]);
  
    return true;
  }
  
  static async addCategory(name) {
    if (!name || typeof name !== 'string') throw new Error('Invalid category name');

    const query = 'INSERT INTO categories (name) VALUES (?)';
    const [result] = await db.execute(query, [name]);

    return { id: result.insertId, name };
  }

}

module.exports = CategoryService