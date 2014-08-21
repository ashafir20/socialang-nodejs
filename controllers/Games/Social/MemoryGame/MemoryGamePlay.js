var mongoose = require('mongoose');
var MemoryGame = mongoose.model("MemoryGame");
var Counters = mongoose.model("Counter");
var colors = require('colors');

exports.MemoryGameRoutesHandler = function (socket, io) {
	socket.on('MemoryGameRoundRequest', function () {
		socket.get('gameRoomID', function (err, gameRoomID) {
			MemoryGame.findByGameRoomID(gameRoomID, function (error, game) {
				if(err) console.log('couldnt find userid in MemoryGameRematchRequest'.error);
				GetNextRound(game, function (memoryGameRound) {
					var jsonResponse = { result : "OK" , round : memoryGameRound };
					io.sockets.in("MG" + gameRoomID).emit('MemoryGameRoundResponse', jsonResponse);
				});
			});
		});
	});

	socket.on('MemoryGameRematchRequest', function () {
		socket.get('gameRoomID', function (err, gameRoomID) {
			MemoryGame.findByGameRoomID(gameRoomID, function (error, game) {
				if(err) console.log('couldnt find game in MemoryGameRematchRequest'.error);
				socket.get('id', function (errorId, id) {
					if(errorId) console.log('couldnt find userid in MemoryGameRematchRequest'.error);
					else if(id){
						if(game.RematchDetails.InviteState == "NoInvite"){
							game.RematchDetails.InviteState = "RematchRequested";
							game.RematchDetails.PlayerInviting = id;
							game.save(function  (error) {
								if(!error) console.log('game was saved! with a new rematch invite'.silly);
							});

							var jsonResponse = { result : "OK", rematch : "SentRematchRequest" };
							socket.emit("MemoryGameRematchResponse", jsonResponse);

						} else if(game.RematchDetails.InviteState = "RematchRequested") {
							var jsonResponse = { result : "OK", rematch : "OpponentRequestedRematchAlready" };
							socket.emit("MemoryGameRematchResponse", jsonResponse);

							jsonResponse = { result : "OK", rematch : "RematchAccepted" };
							socket.broadcast.to("MG" + gameRoomID).emit("MemoryGameRematchResponse", jsonResponse);
							game.RematchDetails.InviteState = "NoInvite";

							game.Player1Score = 0;
							game.Player2Score = 0;
							game.CurrentPlayerTurn = 1;

							game.save(function  (error) {
								if(!error) {
									console.log('game was saved! with a new rematch invite'.silly);
								}
							});
						}
					}
				})
			});
		});
	});


	socket.on('MemoryGameReadyNotify', function (data) {
		socket.get('gameRoomID', function (err, gameRoomID) {
			MemoryGame.findByGameRoomID(gameRoomID, function (error, game) {
				var playerNumber = data.player;
				if(playerNumber == '1'){
					game.Player1Ready = true;
				} else {
					game.Player2Ready = true;
				}

				if(game.Player1Ready && game.Player2Ready) {
					var jsonResponse = { result : "OK" };
					game.RoundNumber++;
					io.sockets.in("MG" + gameRoomID).emit('MemoryGamePlayersAreReady', jsonResponse);
				}

				game.save(function  (error) {
					if(!error) {
						console.log('game was saved!'.silly);
					}
				});

			});
		});
	});


	socket.on('MemoryGameCardPress', function (data) {
		socket.get('gameRoomID', function (err, gameRoomID) {
			MemoryGame.findByGameRoomID(gameRoomID, function (error, game) {
				if(err) throw new Error('no game room found'.error);
				var jsonResponse = data; //echo back

				jsonResponse.result = "OK";
				jsonResponse.OtherPlayerWon = false;
			    jsonResponse.isGameDraw = false;

				game.CurrentPlayerTurn = game.CurrentPlayerTurn == 1 ? 2 : 1;
				game.LastPlay = new Date();
				
				if(data.IsSecondPress == 'true') 
				{
					if(data.wasPlayerCorrect == 'true'){
						if(game.CurrentPlayerTurn == 1) {
							game.Player1Score++;
						} else {
							game.Player2Score++;
						}

						if(game.Player1Score == 5 || game.Player2Score == 5) {
							jsonResponse.OtherPlayerWon = true;
						}
						else if(game.Player1Score == 4 && game.Player2Score == 4){
							jsonResponse.isGameDraw = true;
						}
					}

					game.save(function (err, game) {
						if (err){
							console.error(err);
						} else {
							console.log('game was saved!'.silly);
							console.log('player1score :' + game.Player2Score);
							console.log('player2score :' + game.Player1Score);
							console.log('playerturn :' + game.CurrentPlayerTurn);
						}
					});
				}

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