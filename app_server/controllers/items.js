var request = require('request');
var apiOptions = {
    server : "http://localhost:3000"
};
if (process.env.NODE_ENV === 'production') {
    apiOptions.server = "https://boiling-woodland-82645.herokuapp.com";
}

// For Errors:
var _showError = function (req, res, status) {
    var title, content;
    if (status === 404) {
        title = "404, page not found";
        content = "Oh dear. Looks like we can't find this page. Sorry.";
    } else if (status === 500) {
        title = "500, internal server error";
        content = "How embarrassing. There's a problem with our server.";
    } else {
        title = status + ", something's gone wrong";
        content = "Something, somewhere, has gone just a little bit wrong.";
    }
    res.status(status);
    res.render('generic-text', {
        title : title,
        content : content
    });
};

// For the bartering page
var renderHomepage = function(req, res, responseBody){
    var message;
    if (!(responseBody instanceof Array)) {
        message = "API lookup error";
        responseBody = [];
    } else {
        if (!responseBody.length) {
            message = "No items found";
        }
    }
    console.log(responseBody);
    console.log("temp");
    res.render('barter-list', {
        title: 'Blaster\'s Barter',
        pageHeader: {
            title: 'Barter Items',
            strapline: 'See what\'s currently up for grabs!'
        },
        userid: req.session.userId,
        userList: responseBody,
        message: message
    });
};

module.exports.itemsList = function(req, res) {
    console.log(apiOptions.server);
    var requestOptions, path;
    path = '/api/barter';
    requestOptions = {
        url : apiOptions.server + path,
        method : "GET",
        json : {},
        qs : {}
    };
    request(
        requestOptions,
        function(err, response, body) {
            if (response.statusCode === 200) {
                renderHomepage(req, res, body);
            }
        }
    );
};

// For adding an item
var getUserInfo = function (req, res, callback) {
    var requestOptions, path;
    path = "/api/barter/user/" + req.params.userid;
    requestOptions = {
        url : apiOptions.server + path,
        method : "GET",
        json : {}
    };
    request(
        requestOptions,
        function(err, response, body) {
            if (response.statusCode === 200) {
                callback(req, res, body.items);
            } else {
                _showError(req, res, response.statusCode);
            }
        }
    );
};

var renderItemForm = function (req, res, itemDetail) {
    res.render('item-new', {
        title: 'Add Item to Barter',
        pageHeader: {
            title: 'Add Item to Barter'
        },
        itemDetail: itemDetail,
        error: req.query.err,
        pageType: "add"
    });
};

module.exports.addItem = function(req, res) {
    getUserInfo(req, res, function(req, res, responseData) {
        renderItemForm(req, res, responseData);
    });
};

module.exports.doAddItem = function(req, res) {
    var requestOptions, path, userid, postdata;
    userid = req.params.userid;
    path = "/api/barter/user/" + userid + "/item/new";
    var trade = [];
    if (req.body.tradeItems1 !== '') {
        trade.push({
            "name": req.body.tradeItems1
        })
    }
    if (req.body.tradeItems2 !== '') {
        trade.push({
            "name": req.body.tradeItems2
        })
    }
    if (req.body.tradeItems3 !== '') {
        trade.push({
            "name": req.body.tradeItems3
        })
    }
    if (req.body.tradeItems4 !== '') {
        trade.push({
            "name": req.body.tradeItems4
        })
    }
    if (req.body.tradeItems5 !== '') {
        trade.push({
            "name": req.body.tradeItems5
        })
    }
    console.log(trade);
    postdata = {
        name: req.body.name,
        condition: req.body.condition,
        istrading: false,
        tradingfor: '',
        trader: '',
        tradeItems: trade
    };
    requestOptions = {
        url : apiOptions.server + path,
        method : "POST",
        json : postdata
    };
    if (!postdata.name || !postdata.condition || !postdata.tradeItems) {
        res.redirect('/barter/user/' + userid + '/item/new?err=val');
    } else if (req.body.tradeItems1 === '') {
        res.redirect('/barter/user/' + userid + '/item/new?err=trade');
    } else {
        request(
            requestOptions,
            function(err, response, body) {
                console.log(postdata);
                if (response.statusCode === 201) {
                    res.redirect('/barter/user/' + userid);
                } else if (response.statusCode === 400 && body.name && body.name === 'ValidationError') {
                    res.redirect('/barter/user/' + userid + '/item/new?err=val');
                } else {
                    console.log(body);
                    _showError(req, res, response.statusCode);
                }
            }
        );
    }
};


// For editing an item
var renderEditItemForm = function (req, res, itemDetail) {
    console.log("itemDetail");
    console.log(itemDetail);
    console.log(itemDetail.name);
    res.render('item-edit', {
        title: 'Edit Item',
        pageHeader: { title: 'Edit Item'},
        error: req.query.err,
        itemDetail: itemDetail,
        pageType: "edit"
    });
};



module.exports.editItem = function(req, res) {
    getItemInfo(req, res, function(req, res, responseData) {
        console.log(responseData);
        renderEditItemForm(req, res, responseData);
    });
};



module.exports.doEditItem = function(req, res) {
    var requestOptions, path, userid, postdata, itemid;
    userid = req.params.userid;
    itemid = req.params.itemid;
    path = '/api/barter/user/' + req.params.userid + '/item/' + req.params.itemid;
    var trade = [];
    if (req.body.tradeItems1 !== '') {
        trade.push({
            "name": req.body.tradeItems1
        })
    }
    if (req.body.tradeItems2 !== '') {
        trade.push({
            "name": req.body.tradeItems2
        })
    }
    if (req.body.tradeItems3 !== '') {
        trade.push({
            "name": req.body.tradeItems3
        })
    }
    if (req.body.tradeItems4 !== '') {
        trade.push({
            "name": req.body.tradeItems4
        })
    }
    if (req.body.tradeItems5 !== '') {
        trade.push({
            "name": req.body.tradeItems5
        })
    }
    console.log(trade);
    postdata = {
        name: req.body.name,
        condition: req.body.condition,
        tradeItems: trade
    };
    requestOptions = {
        url : apiOptions.server + path,
        method : "PUT",
        json : postdata
    };
    if (!postdata.name || !postdata.condition || !postdata.tradeItems) {
        res.redirect('/barter/user/' + userid + '/item/' + itemid + '?err=val');
    } else if (postdata.points < 0 || postdata.points > 100) {
        res.redirect('/barter/user/' + userid + '/item/'  + itemid + '?err=trade');
    } else {
        request (
            requestOptions,
            function(err, response, body) {
                console.log(body);
                if (response.statusCode === 200) {
                    res.redirect('/barter/user/' + userid);
                } else if (response.statusCode === 400 && body.name && body.name === "Validation Error" ) {
                    res.redirect('/barter/user/' + userid + '/item/' + itemid + '?err=val');
                } else {
                    _showError(req, res, response.statusCode);
                }
            }
        );
    }
};


// For deleting an item
module.exports.deleteItem = function(req, res) {
	var requestOptions, path;
	path = '/api/barter/user/' + req.params.userid + '/item/' + req.params.itemid + '/delete';
	requestOptions = {
		url : apiOptions.server + path,
		method : "DELETE",
		json : {},
		qs : {}
	};
	request(
		requestOptions,
		function(err, response, body) {
			if (response.statusCode === 204) {
				res.redirect('/barter/user/' + req.params.userid);
			}
		}
	);
};

// For trading an items
var getItemInfo = function (req, res, callback) {
    var requestOptions, path;
    path = '/api/barter/' + req.params.userid + '/item/' + req.params.itemid + '/trade';
    requestOptions = {
        url : apiOptions.server + path,
        method : "GET",
        json : {}
    };
    request(
        requestOptions,
        function(err, response, body) {
            if (response.statusCode === 200) {
              console.log(body);
                callback(req, res, body);
            } else {
                _showError(req, res, response.statusCode);
            }
        }
    );
};

var renderTradeForm = function (req, res, itemDetail) {
    res.render('item-trade', {
        title: 'Item Barter',
        pageHeader: {
            title: 'Item Barter'
        },
        items: itemDetail.tradeItems,
        itemDetail: itemDetail,
        itemname: itemDetail.name,
        itemcond: itemDetail.condition,
        error: req.query.err
    });
};

module.exports.tradeItem = function(req, res) {
    getItemInfo(req, res, function(req, res, responseData) {
        renderTradeForm(req, res, responseData);
    });
};


module.exports.doTradeItem = function(req, res) {
  var requestOptions, path, itemid, userid, postdata;
  itemid= req.params.itemid;
  userid= req.params.userid;
  path = "/api/barter/" + userid + "/item/" + itemid + "/trade";
  postdata = {
      istrading: req.body.istrading,
      tradingfor: req.body.tradingfor,
      trader: req.body.trader
  };
  requestOptions = {
      url : apiOptions.server + path,
      method : "PUT",
      json : postdata
  };
  if (!postdata.tradingfor) {
    res.redirect('/barter/' + userid + 'item/' + itemid + '/trade?err=val');
  } else {
    request(
      requestOptions,
      function(err, response, body) {
        if (response.statusCode === 201 || response.statusCode === 200) {
          res.redirect('/barter');
        } else if (response.statusCode === 400 && body.tradingfor && body.tradingfor === "ValidationError" ) {
          res.redirect('/barter/' + userid + 'item/' + itemid + '/trade?err=val');
        } else {
          _showError(req, res, response.statusCode);
        }
      }
    );
  }
};
