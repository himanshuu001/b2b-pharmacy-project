const router = require('express').Router();
const { signup, login, getProfile, logout } = require('../controllers/authController');
const { authenticate }  = require('../middleware/authMiddleware');
const { validateSignup, validateLogin } = require('../middleware/validation');

router.post('/signup',   validateSignup, signup);
router.post('/login',    validateLogin,  login);
router.get ('/profile',  authenticate,   getProfile);
router.post('/logout',   authenticate,   logout);

module.exports = router;
