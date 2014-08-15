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

	socket.on('MemoryGameCardPress', function (data) {
		socket.get('gameRoomID', function (err, gameRoomID) {
			MemoryGame.findByGameRoomID(gameRoomID, function (error, game) {
				if(err) throw new Error('no game room found');
				var jsonResponse = data; //echo back

				jsonResponse.result = "OK";
				jsonResponse.IsGameDone = false;

				game.CurrentPlayerTurn = game.CurrentPlayerTurn == 1 ? 2 : 1;
				game.LastPlay = new Date();
				
				if(data.IsSecondPress == 'true') 
				{
					if(data.wasPlayerCorrect == 'true')
					{
						if(game.CurrentPlayerTurn == 1) {
							game.Player1Score++;
						} else {
							game.Player2Score++;
						}

						if(game.Player1Score == 5 || game.Player2Score == 5) {
							jsonResponse.IsGameDone = true;
						}
					}
				}

				game.save(function (err, game) {
					if (err){
						console.error(err);
					} else {
						console.log('game was saved : ' + game);
					}
				});

				socket.broadcast.to("MG" + gameRoomID).emit('MemoryGameCardPressOtherPlayerNotify', jsonResponse);
				
			});
		});
	});


};


function GetNextRound(game, callback){

	//length = 8
	var round = [
		 { "word": "DEMO1", "image": null , "pairId" : 1 },
		 { "word": "DEMO2", "image": null , "pairId" : 2 },
		 { "word": "DEMO3", "image": null , "pairId" : 3 },
		 { "word": "DEMO4", "image": null , "pairId" : 4 },
		 { "word": "DEMO5", "image": null , "pairId" : 5 },
		 { "word": "DEMO6", "image": null , "pairId" : 6 },
		 { "word": "DEMO7", "image": null , "pairId" : 7 },
		 { "word": "DEMO8", "image": null , "pairId" : 8 },
	 ];	

	 callback(round); 
}