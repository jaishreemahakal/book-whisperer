const express = require('express');
const { query, param, validationResult } = require('express-validator');
const Book = require('../models/Book');

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().trim().isLength({ max: 100 }).withMessage('Search term too long'),
  query('category').optional().isString().trim(),
  query('minRating').optional().isFloat({ min: 1, max: 5 }).withMessage('Min rating must be between 1 and 5'),
  query('maxRating').optional().isFloat({ min: 1, max: 5 }).withMessage('Max rating must be between 1 and 5'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be positive'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be positive'),
  query('stockStatus').optional().isIn(['in-stock', 'out-of-stock']).withMessage('Invalid stock status'),
  query('sortBy').optional().isIn(['title', 'price', 'rating', 'createdAt']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], handleValidationErrors, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      minRating,
      maxRating,
      minPrice,
      maxPrice,
      stockStatus,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (search) {
      query.$text = { $search: search };
    }

    if (category) {
      query.category = new RegExp(category, 'i');
    }

    if (minRating || maxRating) {
      query.rating = {};
      if (minRating) query.rating.$gte = parseFloat(minRating);
      if (maxRating) query.rating.$lte = parseFloat(maxRating);
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (stockStatus) {
      query.stockAvailability = stockStatus === 'in-stock' ? 'In stock' : 'Out of stock';
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [books, totalBooks] = await Promise.all([
      Book.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Book.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalBooks / limitNum);

    res.json({
      success: true,
      data: books,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalBooks,
        booksPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      },
      filters: req.query
    });

  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({
      error: 'Failed to fetch books',
      message: error.message
    });
  }
});

router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid book ID')
], handleValidationErrors, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        error: 'Book not found',
        message: `No book found with ID: ${req.params.id}`
      });
    }

    res.json({
      success: true,
      data: book.toPublicJSON()
    });

  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({
      error: 'Failed to fetch book',
      message: error.message
    });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const [
      totalBooks,
      inStockBooks,
      categories,
      avgRating,
      priceRange
    ] = await Promise.all([
      Book.countDocuments(),
      Book.countDocuments({ stockAvailability: 'In stock' }),
      Book.distinct('category'),
      Book.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]),
      Book.aggregate([
        {
          $group: {
            _id: null,
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalBooks,
        inStockBooks,
        outOfStockBooks: totalBooks - inStockBooks,
        categories: categories.filter(Boolean),
        averageRating: avgRating[0]?.avgRating || 0,
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 }
      }
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

module.exports = router;