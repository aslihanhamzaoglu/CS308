const CategoryService = require('../services/CategoryService');

const getCategoryTypes = async (req, res) => {
    try {
      const categories = await CategoryService.getCategoryTypes();
      res.status(200).json({ message: 'Category types retrieved successfully', categories });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const getAllCategories = async (req, res) => {
    try {
      const categories = await CategoryService.getAllCategories();
      res.status(200).json({ message: 'All categories retrieved successfully', categories });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const deactivateCategory = async (req, res) => {
    try {
      const { categoryId } = req.body;
      if (!categoryId) return res.status(400).json({ message: 'categoryId is required' });
  
      await CategoryService.deactivateCategory(categoryId);
      return res.status(200).json({ message: 'Category and its products deactivated successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const activateCategory = async (req, res) => {
    try {
      const { categoryId } = req.body;
      if (!categoryId) return res.status(400).json({ message: 'categoryId is required' });
  
      await CategoryService.activateCategory(categoryId);
      return res.status(200).json({ message: 'Category and its products activated successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
const addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const newCategory = await CategoryService.addCategory(name);
    return res.status(201).json({ message: 'Category added', category: newCategory });
  } catch (error) {
    console.error('Error adding category:', error.message);
    return res.status(500).json({ message: 'Failed to add category', error: error.message });
  }
};

module.exports = { getCategoryTypes, addCategory, getAllCategories, deactivateCategory, activateCategory };