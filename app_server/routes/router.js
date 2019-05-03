var express = require('express');
var path = require('path');
var router = express.Router();
var User = require('../models/user');
//var ctrlItems = require('../controllers/items');
var request = require('request');
var apiOptions = {
    server : "http://localhost:3000"
};
if (process.env.NODE_ENV === 'production') {
    apiOptions.server = "https://boiling-woodland-82645.herokuapp.com";
}

var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

var _showError = function (req, res, status) {
    var title, content;
    if (status === 404) {
        title = "404, page not found";
        content = "Oh dear. Looks like we can't find this page. Sorry.";
    } else if (status === 500) {
        title = "500, internal server error";
        content = "How embarrassing. There's a problem with our server.";
    } else if (status === 600) {
        title = "You don't have access to this page!";
        content = "Please try logging in or registering for an account.";
    } else if (status === 401) {
        title = "Wrong Email or Password";
        content = "Please try logging in again or registering for an account.";
    } else if (status === 400) {
        title = "Passwords do not match";
        content = "Please re-try registering for an account.";
    } else if (status === 501) {
        title = "An account already exists for that email address";
        content = "Try logging in or register with a different email address.";
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

router.get('/barter', function(req, res) {
    User.findById(req.session.userId)
        .exec(function (error, user) {
            if (error) {
                _showError(req, res, 600);
            } else {
                if (user === null) {
                    var err = new Error('Not authorized! Go back!');
                    err.status = 400;
                    _showError(req, res, 600);
                    return;
                }
                console.log(apiOptions.server);
                var requestOptions, path;
                path = '/api/barter';
                requestOptions = {
                    url: apiOptions.server + path,
                    method: "GET",
                    json: {},
                    qs: {}
                };
                request(
                    requestOptions,
                    function (err, response, body) {
                        if (response.statusCode === 200) {
                            renderHomepage(req, res, body);
                        }
                    }
                );
            }
        });
});

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

router.get('/barter/user/:userid/item/new', function(req, res) {
    User.findById(req.session.userId)
        .exec(function (error, user) {
            if (error) {
                _showError(req, res, 600);
            } else {
                if (user === null) {
                    var err = new Error('Not authorized! Go back!');
                    err.status = 400;
                    _showError(req, res, 600);
                    return;
                }
                getUserInfo(req, res, function (req, res, responseData) {
                    renderItemForm(req, res, responseData);
                });
            }
        });
});

router.post('/barter/user/:userid/item/new', function(req, res) {
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
    } else if (req.body.tradeItems1 === '' && req.body.tradeItems2 === '' && req.body.tradeItems3 === '' && req.body.tradeItems4 === '' && req.body.tradeItems5 === '') {
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
});


// For editing an item
var renderEditItemForm = function (req, res, itemDetail) {
    res.render('item-edit', {
        title: 'Edit Item',
        pageHeader: { title: 'Edit Item'},
        error: req.query.err,
        itemDetail: itemDetail,
        pageType: "edit"
    });
};



router.get('/barter/user/:userid/item/:itemid', function(req, res) {
    User.findById(req.session.userId)
        .exec(function (error, user) {
            if (error) {
                _showError(req, res, 600);
            } else {
                if (user === null) {
                    var err = new Error('Not authorized! Go back!');
                    err.status = 400;
                    _showError(req, res, 600);
                    return;
                }
                getItemInfo(req, res, function (req, res, responseData) {
                    console.log(responseData);
                    renderEditItemForm(req, res, responseData);
                });
            }
        });
});



router.post('/barter/user/:userid/item/:itemid', function(req, res) {
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
    } else if (req.body.tradeItems1 === '' && req.body.tradeItems2 === '' && req.body.tradeItems3 === '' && req.body.tradeItems4 === '' && req.body.tradeItems5 === '') {
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
});


// For deleting an item
router.get('/barter/user/:userid/item/:itemid/delete', function(req, res) {
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
});

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

router.get('/barter/:userid/item/:itemid/trade', function(req, res) {
    User.findById(req.session.userId)
        .exec(function (error, user) {
            if (error) {
                _showError(req, res, 600);
            } else {
                if (user === null) {
                    var err = new Error('Not authorized! Go back!');
                    err.status = 400;
                    _showError(req, res, 600);
                    return;
                }
                getItemInfo(req, res, function (req, res, responseData) {
                    renderTradeForm(req, res, responseData);
                });
            }
        });
});


router.post('/barter/:userid/item/:itemid/trade', function(req, res) {
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
});


// rejecting an request for trade
router.get('/barter/user/:userid/item/:itemid/reject', function (req, res) {
    console.log("function reached");
	var requestOptions, path, userid, postdata, itemid;
    userid = req.params.userid;
    itemid = req.params.itemid;
    path = "/api/barter/user/" + req.params.userid + "/item/" + req.params.itemid + "/reject";
    postdata = {
        istrading: req.body.istrading,
        trader: req.body.trader,
        tradingfor: req.body.tradingfor
    };
    requestOptions = {
        url : apiOptions.server + path,
        method : "PUT",
        json : postdata
    };
    request (
        requestOptions,
        function(err, response, body) {
            console.log("status:" + response.statusCode);
            if (response.statusCode === 200) {
                res.redirect('/barter/user/' + userid);
            } else if (response.statusCode === 400 && body.istrading && body.istrading === "Validation Error" ) {
                res.redirect('/barter/' + userid + '?err=val');
            } else {
                _showError(req, res, response.statusCode);
            }
        }
    );
});


// Everything below concerns logins:
// GET route after registering
router.get('/barter/user/:userid', function (req, res, next) {
    User.findById(req.session.userId)
        .exec(function (error, user) {
            if (error) {
                return next(error);
            } else {
                if (user === null) {
                    var err = new Error('Not authorized! Go back!');
                    err.status = 400;
                    _showError(req, res, 600);
                    return;
                } else {
                    return res.render('user', {
                        title: 'Blaster\'s Barter',
                        pageHeader: {
                            title: user.username + '\'s Profile'
                        },
                        user: user,
                        userid: req.session.userId
                    });
                }
            }
        });
});

// GET route for reading data
router.get('/', function (req, res, next) {
    User.findById(req.session.userId)
        .exec(function (error, user) {
            if (error) {
                _showError(req, res, 600);
            } else {
                if (user !== null) {
                    return res.redirect('/barter/user/' + req.session.userId);
                }
                return res.sendFile(path.join(__dirname + '/../views/home.html'));
            }
        });
});

router.get('/about', function (req, res) {
	res.render('about', {
    	title: 'About Blaster\'s Barter',
        pageHeader: {
            title: 'About Our App',
            strapline: 'what is this for?'
        },
    });
});

// POST route for updating data
router.post('/', function (req, res, next) {
    // confirm that user typed same password twice
    if (req.body.password !== req.body.passwordConf) {
        var err = new Error('Passwords do not match.');
        err.status = 400;
        _showError(req, res, 400);
        return;
    }

    if (req.body.email &&
        req.body.username &&
        req.body.password &&
        req.body.passwordConf) {

        var userData = {
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            passwordConf: req.body.passwordConf,
            items: []
        };

        User.create(userData, function (error, user) {
            if (error) {
                _showError(req, res, 501);
                return;
            } else {
                req.session.userId = user._id;
                return res.redirect('/barter/user/' + req.session.userId);
            }
        });

    } else if (req.body.logemail && req.body.logpassword) {
        User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
            if (error || !user) {
                console.log(user);
                var err = new Error('Wrong email or password.');
                err.status = 401;
                _showError(req, res, 401);
                return;
            } else {
                req.session.userId = user._id;
                return res.redirect('/barter/user/' + req.session.userId);
            }
        });
    } else {
        var err = new Error('All fields required.');
        err.status = 400;
        return next(err);
    }
});

// GET for logout
router.get('/logout', function (req, res, next) {
    if (req.session) {
        // delete session object
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});

module.exports = router;
