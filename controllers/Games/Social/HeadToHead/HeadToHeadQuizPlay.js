var mongoose = require('mongoose');
var HeadToHeadModel = mongoose.model("HeadToHead");
var User = mongoose.model('User');
var colors = require('colors');
var Dictionary = require("../../../Dictionary/DictionaryController");
var GameHelper  = require('./HeadToHeadQuizGameHelper');

exports.HeadToHeadQuizGameRoutesHandler = function (socket, io) {

	socket.on('roundRequest', function () {
		socket.get('gameRoomID', function (err, gameRoomID) {
			HeadToHeadModel.findByGameRoomID(gameRoomID, function (error, game) {
				if(err) throw new Error('no game room found');
				var locale = Dictionary.GetLanguageLocale(game.Player1.learningLanguage);
				GameHelper.GetNextRound(game, locale, function (headToHeadRound) {
					var jsonResponse = { result : "OK" , round : headToHeadRound };
					io.sockets.in("HTH" + gameRoomID).emit('roundResponse', jsonResponse);
				});
			});
		});
	});

	socket.on('playerActionNotify', function (data) {
		var updatedGame, jsonResponse;
		socket.get('gameRoomID', function (err, gameRoomID) {
			if(err) throw new Error('no game room found');
			HeadToHeadModel.findByGameRoomID(gameRoomID, function (error, game) {
				if(err) throw new Error('no game room found');
				GameHelper.SubmitPlayerAnswer(game, data.answer, function (updatedGame) {
						if(GameHelper.IsAnswerCorrect(updatedGame, data.answer)) {
							var jsonResponse = { result : "OK", answerStatus : "Right", playerAnswer : data.answer};
						} else {
							var jsonResponse = { result : "OK", answerStatus : "Wrong", playerAnswer : data.answer };
						}
						if(updatedGame.Player1NumOfHearts == 0){
							jsonResponse.Player1Lost = 'true';
						} else{
							jsonResponse.Player1Lost = 'false';
						}
						if(updatedGame.Player2NumOfHearts == 0){
							jsonResponse.Player2Lost = 'true';

						} else {
							jsonResponse.Player2Lost = 'false';
						}

						console.log('updated game after press : ' + updatedGame);
						//sending only to other player!
						socket.broadcast.to("HTH" + gameRoomID).emit('playerActionNotifyResponse', jsonResponse);
					});
				});
			});
		});

		socket.on('HeadToHeadRematchRequest', function () {
			socket.get('gameRoomID', function (err, gameRoomID) {
				if(err) throw new Error('no game room found');
				HeadToHeadModel.findByGameRoomID(gameRoomID, function (error, game) {
					if(err) throw new Error('no game room found');
					socket.get('id', function (errorId, id) {
						if(errorId) console.log('couldnt find userid in MemoryGameRematchRequest'.error);
						else if(id)
						{
							if(game.RematchDetails.InviteState == "NoInvite") {
								game.RematchDetails.InviteState = "RematchRequested";
								game.RematchDetails.PlayerInviting = id;
								game.save(function  (error) {
									if(!error) console.log('game was saved! with a new rematch invite'.silly);
								});
							} 
							else if(game.RematchDetails.InviteState = "RematchRequested") {
								jsonResponse = { result : "OK", rematch : "RematchAccepted" };
								io.sockets.in("HTH" + gameRoomID).emit('HeadToHeadRematchResponse', jsonResponse);
								game.RematchDetails.InviteState = "NoInvite";

								game.Player1NumOfHearts = 5;
								game.Player2NumOfHearts = 5;
								game.CurrentPlayerTurn = 1;

								game.save(function  (error) {
									if(!error) {
										console.log('game was saved! '.silly);
									}
								});
							}
						}
					});
				});
		});
	});
};

