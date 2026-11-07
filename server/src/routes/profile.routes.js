const express = require('express');
const {
  getMyProfile,
  updateMyProfile,
  getProfileByUserId
} = require('../controllers/profile.controller');
const { requireAuth } = require('../middlewares/auth');
const { validateBody } = require('../middlewares/validate');
const { updateProfileSchema } = require('../validators/profile.validator');

const router = express.Router();

// Require authentication for all profile routes
router.use(requireAuth);

router.get('/me', getMyProfile);
router.put('/me', validateBody(updateProfileSchema), updateMyProfile);
router.get('/:userId', getProfileByUserId);

module.exports = router;

