var mongoose = require('mongoose');
var User = mongoose.model('User');
var dict = require('../../../controllers/Dictionary/DictionaryController');
var googleTranslate = require('google-translate')('AIzaSyCMgsE-JKzD6YnXen2sEEeoT6OxteRgj24');
var GridFSManager = require('../../../controllers/General/GridFSManager');
var colors = require('colors');

var questions = ['dog', 'baby', 'house', 'car',];
var filenames = ['dog1.png', 'baby1.png', 'house1.png', 'car1.png'];

exports.PhotoGuessHandler = function (socket) {
	socket.on('PictureQuizGameQuestionRequest', function () {
		console.log("in PhotoGuessHandler RoundRequest");
		var randIndex = Math.floor(Math.random() * questions.length);
		var randQuestion = questions[randIndex];
		dict.TranslateWord(randQuestion, socket, function (err, q) {
			var jsonResponse = {};
			if(err) {
				jsonResponse = { result: 'Failed'};
				console.log('Failed to translate word'.error);
			} else {
				var jsonFileNamesToClient = [{answer : filenames[randIndex]}];
				var imagesNamesTaken = [filenames[randIndex]];
				var randomImageIndex;
				for (var i = 1; i < 4; i++) {
					do {
						randomImageIndex = Math.floor(Math.random() * filenames.length);
					} while (imagesNamesTaken.indexOf(filenames[randomImageIndex]) != -1);
					
					imagesNamesTaken.push(filenames[randomImageIndex]);
					jsonFileNamesToClient.push({random : filenames[randomImageIndex]});
				};

				jsonResponse = { result: 'OK', question: q, filenames: jsonFileNamesToClient };
			}

			socket.emit('PictureQuizGameQuestionResponse', jsonResponse);

		});
	});
}


exports.handleFileRequests = function (data, writestream) {
	if(data.routeKey == 'PictureQuizGameImageRequest') {
	  console.log(data);
	  GridFSManager.GetImageByName(data.filename, function (readstream) {
	  	  readstream.pipe(writestream);
	  });

	}
}
