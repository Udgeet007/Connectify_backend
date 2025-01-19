const express = require('express');
const { sendMessage, getChat,  } = require('../controllers/messageController');
const checkToken = require('../middleware/checkToken');
const router = express.Router();


router.post('/sendMessage/:friendId', checkToken,sendMessage);
router.get('/getchat/:friendId', checkToken, getChat);


module.exports = router;