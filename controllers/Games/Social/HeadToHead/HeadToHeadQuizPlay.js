var mongoose = require('mongoose');
var HeadToHeadModel = mongoose.model("HeadToHead");
var User = mongoose.model('User');
var colors = require('colors');
var Dictionary = require("../../../Dictionary/DictionaryController");
var GameHelper  = require('./HeadToHeadQuizGameHelper');

exports.HeadToHeadQuizGameRoutesHandler = function (socket, io) {

	socket.on('roundRequest', function ()
	{
		socket.get('gameRoomID', function (err, gameRoomID) {
			HeadToHeadModel.findByGameRoomID(gameRoomID, function (error, game) {
				if(err) {
					console.log('no game room found in socket'.error);
				}
				else if(game){
					console.log(game);
					var locale = Dictionary.GetLanguageLocale(game.Player1.learningLanguage);
					GameHelper.GetNextRound(game, locale, function (headToHeadRound) {
						var jsonResponse = { result : "OK" , round : headToHeadRound };
						io.sockets.in("HTH" + gameRoomID).emit('roundResponse', jsonResponse);
					});
				} else {
					console.log('error finding game in h2h roundRequest'.error);
				}
			});
		});
	});

	socket.on('playerActionNotify', function (data) 
	{
		var updatedGame, jsonResponse;
		socket.get('gameRoomID', function (err, gameRoomID) 
		{
			if(err) {
				console.log('no game room found'.error);
			}
			else
			{
				playerActionNotifyHelper(gameRoomID, data);
			}
		});
	});

	function playerActionNotifyHelper(gameRoomID, data)
	{
		HeadToHeadModel.findByGameRoomID(gameRoomID, function (error, game) 
		{
				if(error) {
					console.log('no game room found in collection'.error);
				}
				else if(data.timerEnd == 'true')
				{
					GameHelper.SubmitPlayerTimerEnd(game, function (updatedGame)
					{
						var jsonResponse = { result : "OK", answerStatus : "timerEnd" };
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
				}
				else
				{
					GameHelper.SubmitPlayerAnswer(game, data.answer, function (updatedGame) 
					{
						if(GameHelper.IsAnswerCorrect(updatedGame, data.answer)) 
						{
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
				}
			});
	}



	socket.on('HeadToHeadRematchRequest', function () {
		socket.get('gameRoomID', function (err, gameRoomID) {
			if(err) {
				console.log('no game room found'.error);
			}
			else {
				HeadToHeadRematchRequestHelper(gameRoomID);
			}
		});
	});

	function HeadToHeadRematchRequestHelper(gameRoomID) {
		HeadToHeadModel.findByGameRoomID(gameRoomID, function (error, game) 
		{
			if(error) {
				console.log('no game room found'.error);
			}
			else
			{
				socket.get('id', function (errorId, id) {
					if(errorId) console.log('couldnt find userid in MemoryGameRematchRequest'.error);
					else if(id)
					{
						if(game.RematchDetails.InviteState == "NoInvite") 
						{
							game.RematchDetails.InviteState = "RematchRequested";
							game.RematchDetails.PlayerInviting = id;
							game.save(function  (error) {
								if(!error) console.log('game was saved! with a new rematch invite'.silly);
							});
						} 
						else if(game.RematchDetails.InviteState == "RematchRequested") 
						{
							var jsonResponse = { result : "OK", rematch : "RematchAccepted" };
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
			}
		});
	}

	socket.on('HeadToHeadRematchDeniedNotify', function () {
		socket.get('gameRoomID', function (err, gameRoomID) {
			if(err) {
				console.log('no game room found');
			}
			else
			{
				HeadToHeadModel.findByGameRoomID(gameRoomID, function (error, game) {
					if(error) console.log('no game room found');
					else
					{
						game.RematchDetails.InviteState == "RematchDeclined" 
						game.save(function  (error) {
							if(!error) {
								console.log('game was saved! '.silly);
							}
						});
					}
				});
			}
		});
	});
}

