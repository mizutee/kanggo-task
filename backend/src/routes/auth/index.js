const express = require('express');
const AuthController = require('../../controllers/AuthController');

const router = express.Router();

router.post('/register', AuthController.RegisterController);
router.post('/login', AuthController.LoginController);

module.exports = router;
