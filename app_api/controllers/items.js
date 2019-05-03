var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Users = mongoose.model('User');

var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

module.exports.barterItems = function (req, res) {
    Users
        .find({})
        .select('items username')
        .exec(function(err, user) {
            if (!user) {
                sendJSONresponse(res, 404, {
                    "message": "there are no items!"
                });
                return;
            } else if (err) {
                console.log(err);
                sendJSONresponse(res, 404, err);
                return;
            }
            console.log(user);
            sendJSONresponse(res, 200, user);
        });
};

module.exports.userInfo = function(req, res) {
    console.log('Finding user details', req.params);
    if (req.params && req.params.userid) {
        Users
            .findById(req.params.userid)
            .exec(function(err, user) {
                if (!user) {
                    sendJSONresponse(res, 404, {
                        "message": "userid not found"
                    });
                    return;
                } else if (err) {
                    console.log(err);
                    sendJSONresponse(res, 404, err);
                    return;
                }
                console.log(user);
                sendJSONresponse(res, 200, user);
            });
    } else {
        console.log('No userid specified');
        sendJSONresponse(res, 404, {
            "message": "No userid in request"
        });
    }
};

module.exports.itemsDeleteOne = function(req, res) {
    if (req.params && req.params.userid && req.params.itemid) {
        Users
            .findById(req.params.userid)
            .select()
            .exec(
                function (err, user) {
                    if (!user) {
                        sendJSONresponse(res, 404, {
                            "message": "userid not found"
                        });
                        return;
                    } else if (err) {
                        sendJSONresponse(res, 400, err);
                        return;
                    }
                    if (user.items && user.items.length > 0) {
                        if (!user.items.id(req.params.itemid)) {
                            sendJSONresponse(res, 404, {
                                "message": "itemid not found"
                            });
                        } else {
                            user.items.id(req.params.itemid).remove();
                            user.save(function (err) {
                                console.log(err);
                                if (err) {
                                    sendJSONresponse(res, 404, err);
                                } else {
                                    sendJSONresponse(res, 204, null);
                                }
                            });
                        }
                    } else {
                        sendJSONresponse(res, 404, {
                            "message": "No item to delete"
                        });
                    }
                }
            );
    } else {
        sendJSONresponse(res, 404, {
            "message": "Not found, userid and itemid are both required"
        });
    }
};


module.exports.itemsCreateOne = function(req, res) {
    if (req.params.userid) {
        Users
            .findById(req.params.userid)
            .select()
            .exec(
                function(err, user) {
                    if (err) {
                    	sendJSONresponse(res, 400, {
                            "message": "err found 2"
                        });
                    } else {
                        doAddItem(req, res, user);
                    }
                }
            );
    } else {
        sendJSONresponse(res, 404, {
            "message": "Not found, userid required"
        });
    }
};


var doAddItem = function(req, res, user) {
    if (!user) {
        sendJSONresponse(res, 404, "userid not found");
    } else {
        user.items.push({
            name: req.body.name,
            condition: req.body.condition,
            istrading: false,
            tradingfor: '',
            trader: '',
            tradeItems: req.body.tradeItems
        });
        user.save(function(err, user) {
            var thisItem;
            console.log(err);
            if (err) {
                sendJSONresponse(res, 400, {
                  "message": "err found"
                });
            } else {
                thisItem = user.items[user.items.length - 1];
                sendJSONresponse(res, 201, thisItem);
            }
        });
    }
};


/* assignUpdateOne */
module.exports.itemUpdateOne = function (req, res) {
  if (!req.params.userid || !req.params.itemid) {
    sendJsonResponse(res, 404, {
      "message": "Not found, userid and itemid are both required"
    });
    return;
  }
  Users.findById(req.params.userid).select().exec(
    function(err, user) {
      console.log(user);
      console.log("========");
      console.log(err);
      var thisItem;
      if (!user) {
        sendJSONresponse(res, 400, "message : userid not found");
        return;
      } else if (err) {
        sendJSONresponse(res, 400, err);
        return;
      }
      if (user.items && user.items.length > 0) {
        thisItem = user.items.id(req.params.itemid);
        if (!thisItem) {
          sendJSONresponse(res, 404, {
            "message": "itemid not found"
          });
        } else {
          thisItem.name = req.body.name;
          thisItem.condition = req.body.condition;
          thisItem.tradeItems = req.body.tradeItems;
          user.save( function(err,user) {
            if(err) {
              console.log(err);
              sendJSONresponse(res, 404, "error occured");
            } else {
              sendJSONresponse(res, 200, thisItem);
              console.log(thisItem);
            }
          });
        }
      } else {
        sendJSONresponse(res, 404, {
          "message": "No assign to update"
        });
      }
    }
  );
};


module.exports.itemInfo = function (req, res) {
    Users
        .find({})
        .select('items username')
        .exec(function(err, user) {
            if (!user) {
                sendJSONresponse(res, 404, {
                    "message": "there are no items!"
                });
                return;
            } else if (err) {
                console.log(err);
                sendJSONresponse(res, 404, err);
                return;
            }
            if (user && user.length > 0) {
                var item;
                for (var i = 0; i < user.length; ++i) {
                    for (var j = 0; j < user[i].items.length; ++j) {
                        if (user[i].items.id(req.params.itemid)) {
                            item = user[i].items.id(req.params.itemid);
                        }
                    }
                }
                console.log(item);
                if (!item) {
                    console.log("Not found");
                    sendJSONresponse(res, 404, {
                        "message": "itemid not found"
                    });
                } else {
                    console.log("item is found");
                    sendJSONresponse(res, 200, item);
                }
            } else {
                sendJSONResponse(res, 404, {
                    "message": "No items found"
                });
            }
        });
};

module.exports.doTradeItem = function (req, res) {
    var userTrading;
    console.log("1");
    if (!req.params.itemid || !req.params.userid) {
      console.log("2");
      sendJSONresponse(res, 404, {
        "message": "Not found, itemid and userid is required"
      });
      return;
    }
    Users
        .findById(req.params.userid)
        .exec(function (error, user) {
            userTrading = user;
            console.log(user);
            Users
                .find({})
                .select()
                .exec(function(err, user) {
                    var thisItem, loc, thisUser;
                    if (!user) {
                        console.log("3");
                        sendJSONresponse(res, 404, {
                            "message": "there are no items!"
                        });
                        return;
                    } else if (err) {
                        console.log("4");
                        sendJSONresponse(res, 404, err);
                        return;
                    }
                    if (user && user.length > 0) {
                        for (var i = 0; i < user.length; ++i) {
                            for (var j = 0; j < user[i].items.length; ++j) {
                                if (user[i].items.id(req.params.itemid)) {
                                    thisItem = user[i].items.id(req.params.itemid);
                                    loc = i;
                                }
                            }
                        }
                        if (!thisItem) {
                            sendJSONresponse(res, 404, {
                                "message": "itemid not found"
                            });
                        } else {
                        thisItem.tradingfor = req.body.tradingfor;
                        thisItem.istrading = true;
                        thisItem.trader = userTrading.username;
                        user[loc].save(function(err, user) {
                            if (err) {
                            sendJSONresponse(res, 404, err);
                            } else {
                            sendJSONresponse(res, 200, thisItem);
                            }
                        });
                        }
                    } else {
                        sendJSONResponse(res, 404, {
                            "message": "No items to trade"
                        });
                    }
                });
        });
};

// when user reject to trade item
module.exports.rejectTrade = function (req, res) {
	if (!req.params.userid || !req.params.itemid) {
    	sendJsonResponse(res, 404, {
      		"message": "Not found, userid and itemid are both required"
    	});
    	return;
  	}
  	Users.findById(req.params.userid).select().exec(
    function(err, user) {
      var thisItem;
      if (!user) {
        sendJSONresponse(res, 400, "message : userid not found");
        return;
      } else if (err) {
        sendJSONresponse(res, 400, err);
        return;
      }
      if (user.items && user.items.length > 0) {
        thisItem = user.items.id(req.params.itemid);
        if (!thisItem) {
          sendJSONresponse(res, 404, {
            "message": "itemid not found"
          });
        } else {
          thisItem.istrading = false;
          thisItem.trader = "";
          thisItem.tradingfor = "";
          user.save( function(err,user) {
            if(err) {
              console.log(err);
              sendJSONresponse(res, 404, "error occured");
            } else {
              sendJSONresponse(res, 200, thisItem);
              console.log(thisItem);
            }
          });
        }
      } else {
        sendJSONresponse(res, 404, {
          "message": "No assign to update"
        });
      }
    }
  );
};
