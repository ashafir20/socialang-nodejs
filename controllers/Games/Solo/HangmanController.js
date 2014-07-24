var mongoose = require('mongoose');
var User = mongoose.model('User');
var dict = require('../../../controllers/Dictionary/DictionaryController');
var googleTranslate = require('google-translate')('AIzaSyCMgsE-JKzD6YnXen2sEEeoT6OxteRgj24');
var colors = require('colors');


exports.HangmanHandler = function (socket) {

	socket.on('hangmanWordRequest', function () {
		console.log("in hangmanWordRequest");
		dict.getRandomWord(function (randomWord) {
			dict.TranslateWord(randomWord, socket, function (err, hint) {
				var jsonResponse;
				if(err) {
					jsonResponse = { result : "Failed" }; 
				} else {
					jsonResponse = { result : "OK", Answer : randomWord, Hint : hint }; 
				}
		  		socket.emit("hangmanWordResponse", jsonResponse);
			});
		});
	});


	socket.on('hangmanGameOverNotify', function () {
		
	});
}



