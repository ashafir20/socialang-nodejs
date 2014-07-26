var mongoose = require('mongoose');
var MemoryGame = mongoose.model("MemoryGame");
var Counters = mongoose.model("Counter");
var colors = require('colors');

exports.MemoryGameRoutesHandler = function (socket, io) {
	socket.on('MemoryGameRoundRequest', function () {
		socket.get('gameRoomID', function (err, gameRoomID) {
			MemoryGame.findByGameRoomID(gameRoomID, function (error, game) {
				if(err) throw new Error('no game room found');
				GetNextRound(game, function (memoryGameRound) {
					var jsonResponse = { result : "OK" , round : memoryGameRound };
					io.sockets.in("MG" + gameRoomID).emit('MemoryGameRoundResponse', jsonResponse);
				});
			});
		});
	});
};


function GetNextRound(game, callback){

	//length = 8
	var round = [
		 { "word": "DEMO1", "image": null },
		 { "word": "DEMO2", "image": null },
		 { "word": "DEMO3", "image": null},
		 { "word": "DEMO4", "image": null },
		 { "word": "DEMO5", "image": null },
		 { "word": "DEMO6", "image": null },
		 { "word": "DEMO7", "image": null },
		 { "word": "DEMO8", "image": null },
	 ];	

	 callback(round); 
}