var mongoose = require('mongoose');
//collctions
var User = mongoose.model("User");
var Counters = mongoose.model("Counter");

//modules
var colors = require("colors");

//services
var dict = require('../../../controllers/Dictionary/DictionaryController');
var googleTranslate = require('google-translate')('AIzaSyCMgsE-JKzD6YnXen2sEEeoT6OxteRgj24');
var GridFSManager = require('../../../controllers/General/GridFSManager');

exports.HandleRoutes = function (socket) {
	socket.on('quickLearnRoundRequest', function (data) {
		///only need to return a random words that will be the second answer in each item
		console.log("in quickLearnRoundRequest");
		var inserted = 0;
		var results = [];

		var totalNumOfWords = 10;

		for (var i = 0; i < totalNumOfWords; i++) {
			dict.getRandomWord(function (randomWord) {
				dict.TranslateWord(randomWord, socket, function (err, translatedWord) {
					var jsonResponse;
					results.push({'answer2' : translatedWord });
				    if (++inserted == totalNumOfWords) {
				    	var jsonResponse = { 'result' : "OK", 'items' : results };
				        socket.emit("quickLearnRoundResponse", jsonResponse);
				    }			  		
				});
			});
		}
    });
}