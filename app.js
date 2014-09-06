var express = require('express');
var db = require('./data/db');
var colors = require('colors');
var http = require('http');

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

var app = express();

var osipaddress = process.env.OPENSHIFT_NODEJS_IP;
var osport = process.env.OPENSHIFT_NODEJS_PORT;

var app = express();
var osipaddress = process.env.OPENSHIFT_NODEJS_IP;
var osport = process.env.OPENSHIFT_NODEJS_PORT;
app.set('port', osport || 3000);
app.set('ipaddress', osipaddress);

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

var server = http.createServer(app);

server.listen(app.get('port'), app.get('ipaddress'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

//SOCKET.IO INITIALIZE
var router = require('./router.js');
try{
    router.initialize(server);
} catch(ex){
    console.log('in main catch');
    console.log(ex);
}


