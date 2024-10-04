const express = require('express');
const checkAuth = require('../middelware/checkAuth');
const  {delete_one, getAll, getById,initiate}  = require('../controllers/chatRoomController');

const router = express.Router();

router.post('/chats/initiate/:receiver_id/:page_nbr', initiate);
router.get('/chats/:page_nbr', getAll);
router.get('/chats/byid/:_id', getById); 
router.get('/chats/subscribe/:_id', getById);
router.delete('/chats/:_id', delete_one);

module.exports = router;
