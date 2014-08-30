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
				callback(game.LastRound);
			});
		});	
	});
}

exports.IsAnswerCorrect = function (game, answer) {
	if(game) {
		if(game.LastRound.Answer === answer){
			return true;
		} else {
			return false;
		}
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
	//if(game) {
		//if(game.CurrentPlayerTurn == 1) {
			//game.Player1NumOfHearts++;
		//} else {
			//game.Player2NumOfHearts++;
		//}
	//} else {
		//console.log('no game entered for HandleCorrectAnswer');
	//}

}


exports.SubmitPlayerTimerEnd = function (game, callback) {
	if(game) {
		HandleWrongAnswer(game);
		if(game.CurrentPlayerTurn == 1){
			game.CurrentPlayerTurn = 2;
		} else {
			game.CurrentPlayerTurn = 1;
		}
		
		game.save(function (err) {
			if(err) throw new Error('error saving game when submitting answer!');
			console.log('game saved after submitting answer!');
			callback(game);
		});
	} else {
		console.log('no game entered for SubmitPlayerAnswer');
	}
}

exports.SubmitPlayerAnswer = function(game, answer, callback) {
	if(game) {
		if(answer === game.LastRound.Answer){
			HandleCorrectAnswer(game);
		} else {
			HandleWrongAnswer(game);
		}

		if(game.CurrentPlayerTurn == 1){
			game.CurrentPlayerTurn = 2;
		} else {
			game.CurrentPlayerTurn = 1;
		}
		
		game.save(function (err) {
			if(err) throw new Error('error saving game when submitting answer!');
			console.log('game saved after submitting answer!');
			callback(game);
		});
	} else {
		console.log('no game entered for SubmitPlayerAnswer');
	}
}

