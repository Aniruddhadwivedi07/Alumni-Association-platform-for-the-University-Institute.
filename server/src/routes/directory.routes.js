const express = require('express');
const { getAlumniDirectory } = require('../controllers/directory.controller');
const { requireAuth } = require('../middlewares/auth');
const { validateQuery } = require('../middlewares/validate');
const { directoryQuerySchema } = require('../validators/directory.validator');

const router = express.Router();

// Require authentication for directory endpoints
router.use(requireAuth);

router.get('/alumni', validateQuery(directoryQuerySchema), getAlumniDirectory);

module.exports = router;

