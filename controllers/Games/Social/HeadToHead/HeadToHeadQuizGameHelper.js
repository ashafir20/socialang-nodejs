var mongoose = require('mongoose');
var googleTranslate = require('google-translate')('AIzaSyCMgsE-JKzD6YnXen2sEEeoT6OxteRgj24');
var HeadToHeadModel = mongoose.model("HeadToHead");

/*        languagesToLocalMap.put("Spanish", "es");
        languagesToLocalMap.put("Hebrew", "he");
        languagesToLocalMap.put("French", "fr");
        languagesToLocalMap.put("German", "de");
        languagesToLocalMap.put("Italian", "it");
        languagesToLocalMap.put("Dutch", "nl");
        languagesToLocalMap.put("Greek", "el");
        languagesToLocalMap.put("Russian", "ru");*/


exports.GetNextRound = function (game, locale, callback){
	HeadToHeadModel.GetRound(function (words) {
		console.log(words);
		var round = { Answer :  words[0] };
		googleTranslate.translate(words[0], locale , function (err, translation) {
			if(err) throw new Error("error in word translate");
			var question = translation.translatedText;
			console.log('Question : ' + question);
			round.Q = question;
			shuffledWords = HeadToHeadModel.ShuffleWords(words);
			console.log('Suffled words : ' + shuffledWords);
			round.A = shuffledWords;
			game.LastRound = round;
			game.save(function (errSaving){
				if(errSaving) if(err) throw new Error('error saving game when getting next round');
				console.log('game saved! : ' + game);
				callback(game.LastRound);
			});
		});	
	});
}

exports.IsAnswerCorrect = function (game, answer) {
	if(game) {
		console.log('in IsAnswerCorrect with answer : ' + answer);
		console.log('in IsAnswerCorrect with last round as : ' + game.LastRound);
		var answerStatus = game.LastRound.Answer === answer;
		console.log('in IsAnswerCorrect returnning  : ' + answerStatus);
		return answerStatus;
	} else {
		console.log('no game entered for IsAnswerCorrect');
	}
}


function HandleWrongAnswer (game) {
	if(game) {
		if(game.CurrentPlayerTurn == 1) {
			game.Player1NumOfHearts--;
		} else {
			game.Player2NumOfHearts--;
		}
	} else {
		console.log('no game entered for HandleWrongAnswer');
	}
}


function HandleCorrectAnswer(game) {
	if(game) {
		if(game.CurrentPlayerTurn == 1) {
			game.Player1NumOfHearts++;
		} else {
			game.Player2NumOfHearts++;
		}
	} else {
		console.log('no game entered for HandleCorrectAnswer');
	}

}


exports.SubmitPlayerAnswer = function(game, answer, callback) {
	if(game) {
		console.log('submitting player answer in game : ' + game);
		if(answer === game.LastRound.Answer){
			HandleCorrectAnswer(game);
		} else {
			HandleWrongAnswer(game);
		}
		game.CurrentPlayerTurn == game.CurrentPlayerTurn == 1 ? 2 : 1;
		game.save(function (err) {
			if(err) throw new Error('error saving game when submitting answer!');
			console.log('game saved after submitting answer!');
			callback(game);
		});
	} else {
		console.log('no game entered for SubmitPlayerAnswer');
	}
}

