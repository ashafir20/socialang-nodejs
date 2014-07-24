var mongoose = require('mongoose');
var HeadToHeadModel = mongoose.model("HeadToHead");
var User = mongoose.model('User');
var colors = require('colors');

var GameHelper  = require('./HeadToHeadQuizGameHelper');

exports.HeadToHeadQuizGameRoutesHandler = function (socket, io) {

	socket.on('roundRequest', function () {
		socket.get('gameRoomID', function (err, gameRoomID) {
			HeadToHeadModel.findByGameRoomID(gameRoomID, function (error, game) {
				if(err) throw new Error('no game room found');
				GameHelper.GetNextRound(game, function (headToHeadRound) {
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
						socket.broadcast.to("HTH" + gameRoomID).emit('playerActionNotifyResponse', jsonResponse);
					});
				});
			});
		});

};

