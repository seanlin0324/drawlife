/*
 * GET home page.
 */
'use strict';

//var utils = require('connect').utils;

//  Main Page
exports.index = function (req, res, next) {
    res.render('index');
};

exports.room = function (req, res, next) {
    res.render('room');
};

exports.create = function (req, res, next) {

    //var uid = utils.uid(10);
    //console.log('uid = ' + uid);

    // new Hashlist({
    //     hash_id    : uid,
    //     enable     : true,
    //     updated_at : Date.now()
    // }).save(function (err, list, count) {
    //     if (err) {
    //         res.redirect('/');
    //     }
    //     res.redirect('/room/' + uid);
    // });
};


//  User Logout & clear session.
exports.logout = function (req, res, next) {
    req.session.destroy();
    res.redirect('/');
};

