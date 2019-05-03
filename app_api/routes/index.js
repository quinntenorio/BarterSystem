var express = require('express');
var router = express.Router();
var ctrlItems = require('../controllers/items');

router.get('/barter', ctrlItems.barterItems);
router.get('/barter/user/:userid', ctrlItems.userInfo);
router.delete('/barter/user/:userid/item/:itemid/delete', ctrlItems.itemsDeleteOne);
router.post('/barter/user/:userid/item/new', ctrlItems.itemsCreateOne);
router.put('/barter/user/:userid/item/:itemid', ctrlItems.itemUpdateOne);
router.get('/barter/:userid/item/:itemid/trade', ctrlItems.itemInfo);
router.put('/barter/:userid/item/:itemid/trade', ctrlItems.doTradeItem);
router.get('/barter/user/:userid/item/:itemid/reject', ctrlItems.userInfo);
router.put('/barter/user/:userid/item/:itemid/reject', ctrlItems.rejectTrade);


module.exports = router;
