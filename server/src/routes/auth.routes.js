const express = require('express');
const { register } = require('../controllers/auth.controller');
const { validateBody } = require('../middlewares/validate');
const { registerSchema } = require('../validators/auth.validator');

const router = express.Router();

router.post('/register', validateBody(registerSchema), register);

module.exports = router;

