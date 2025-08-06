const express = require('express');
const watchlistController = require('../controllers/watchlistController');

const router = express.Router();

router.get('/', watchlistController.getWatchlist);
router.post('/', watchlistController.addToWatchlist);
router.delete('/:stockId', watchlistController.removeFromWatchlist);

module.exports = router;