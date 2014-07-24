/*
var net = require('net');

var PhotoGuessController = require('../../controllers/Games/Solo/PhotoGuessController');

var fileServer = net.createServer(function (socket) { //'connection' listener
    console.log('server connected');

    socket.on('end', function() {
        console.log('fileServer socket closed.');
    });

	socket.on('data', function (data) {
	  console.log(data.toString());
	  var jsonData = JSON.parse(data);
	  PhotoGuessController.handleFileRequests(jsonData, socket);
	  //add your handler here

	});


}).listen(8124);*/




