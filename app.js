var express = require('express');
var db = require('./data/db');
var colors = require('colors');

colors.setTheme({
    silly: 'yellow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});


var PORT = process.env.PORT || 8000;

var app = express();
var server = app.listen(PORT);

app.configure(function() {
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.cookieParser()); 
    app.use(express.bodyParser());
    app.use(express.session({ secret: 'ilovescotchscotchyscotchscotch' })); 
    app.use(express.methodOverride());
    app.use(app.router);
});

app.configure('development', function(){
    app.use(express.errorHandler());
});

console.log("socialang server listening on port " + PORT);

//SOCKET.IO INITIALIZE
var router = require('./routes/router.js');
router.initialize(server);

