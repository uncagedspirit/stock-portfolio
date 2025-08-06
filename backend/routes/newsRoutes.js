const express = require('express');
const newsController = require('../controllers/newsController');

const router = express.Router();

router.get('/', newsController.getLatestNews);
router.get('/stock/:symbol', newsController.getNewsByStock);

module.exports = router;