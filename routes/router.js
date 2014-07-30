var io = require('socket.io');
var mongoose = require('mongoose');
var HeadToHeadModel = mongoose.model("HeadToHead");

//setting the proxy server
var util = require('util');
var http = require('http');
var httpProxy = require('http-proxy');


exports.initialize = function(server) {

    io = io.listen(server);

    //
    // Create a proxy server with node-http-proxy
    //
    //
    // Setup our server to proxy standard HTTP requests
    //
/*    //-----------------------------------------------------------
    var proxy = new httpProxy.createProxyServer({
      target: {
        host: 'localhost',
        port: 7878
      }
    });

    var proxyServer = http.createServer(function (req, res) {
      proxy.web(req, res);
    });

    proxyServer.on('upgrade', function (req, socket, head) {
      proxy.ws(req, socket, head);
    });

   proxyServer.listen(7979); 
    
//-----------------------------------------------------------*/

/*    io.configure(function () { 
      io.set("transports", ["websocket", "xhr-polling"]);
      io.set("polling duration", 10);
    });*/

    io.sockets.on('connection', function (socket) {
        console.log('SocketIO connection Established!');

        socket.send(JSON.stringify({
            type : 'serverMessage',
            message : 'Connected to socialLang server!'
        }));

        require('../controllers/ActivityControllers/LoginLocalActivityController').Login(socket);
        require('../controllers/ActivityControllers/RegisterActivityController').Signup(socket);
        require('../controllers/ActivityControllers/LoginFacebook').LoginFacebook(socket);
        require('../controllers/ActivityControllers/MainActivityController').HomeActivityHandler(socket);
        require('../controllers/Games/Solo/QuizController').startQuizGame(socket);

       
        require('../controllers/Games/Social/RoomController').GamesRoomRoutesHandler(socket, io);
        require('../controllers/Games/Social/HeadToHead/HeadToHeadQuizPlay').HeadToHeadQuizGameRoutesHandler(socket, io);
        require('../controllers/Games/Social/StudentTeacherGame/StudentTeacherLessonController').StudentTeacherGameHandler(socket, io);
        require('../controllers/Games/Social/MemoryGame/MemoryGamePlay').MemoryGameRoutesHandler(socket, io);

        require('../controllers/Games/Social/GamesListController').WaitingGamesListHandler(socket);
        require('../controllers/Chat/Chat').ChatHandler(socket, io);
        require('../controllers/General/connection').disconnectHandler(socket);
        require('../controllers/ActivityControllers/CommunityController').CommunityHandler(socket);

        require('../controllers/Games/Solo/HangmanController').HangmanHandler(socket);


        require('../controllers/ActivityControllers/ProfileActivityController').ProfileActivityHandler(socket);

        //require('../controllers/Games/Solo/PhotoGuessController').PhotoGuessHandler(socket);

    });

};


