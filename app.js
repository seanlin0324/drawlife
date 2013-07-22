/**
 * Module dependencies.
 */
'use strict';

var express = require('express'),
    http = require('http'),
    parseCookie = require('connect').utils.parseCookie,
    MemoryStore = require('connect/lib/middleware/session/memory'),
    setting = require('./site-config'),

    utility = require('./utility'),
    port = process.env.PORT || setting.site.port;

// Routes
var routes = require('./routes/index');

var app = express();


var storeMemory = new MemoryStore({
    reapInterval: 60000 * 10
});

// Configuration
app.engine('.ejs', require('ejs').__express);

app.configure(function() {
    app.set('port', port);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger());
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({
        secret: 'co-drawlife',
        store: storeMemory
    }));

    app.use(express.static(__dirname + '/public'));
    app.use(app.router);
});

app.configure('development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.locals.pretty = true;
});

app.configure('production', function() {
    app.use(express.errorHandler());
});


app.get('/', function (req, res) {
    res.sendfile(__dirname + '/public/index.html');
});


app.get('/room', routes.room);
app.post('/create', routes.create);
app.get('/logout', routes.logout);

var server = http.createServer(app);

server.listen(port, function() {
    app.sockets = require('./socket.server')(server);
    console.log("Express server listening on port " + setting.site.port + " in " + process.env.NODE_ENV + " mode");
});