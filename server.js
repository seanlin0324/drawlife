var http = require('http');
    app = require('./app');
    server = http.createServer(app);
    port = app.get('port');


server.listen(port, function(){
    app.sockets = require('./socket.server')(server);
    console.log("Express server listening on port " + port);
});

