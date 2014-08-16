var TTS = require("../General/TTS");
var Dictionary = require("../Dictionary/DictionaryController");
var googleTranslate = require('google-translate')('AIzaSyCMgsE-JKzD6YnXen2sEEeoT6OxteRgj24');

var languagesLocales = ['es', 'fr', 'de', 'it', 'nl'];
/*languagesToLocalMap.put("Spanish", "es");
languagesToLocalMap.put("Hebrew", "he");
languagesToLocalMap.put("French", "fr");
languagesToLocalMap.put("German", "de");
languagesToLocalMap.put("Italian", "it");
languagesToLocalMap.put("Dutch", "nl");*/

exports.HandleTranslations = function (socket) {
	socket.on('translateRequest', function (data) {
		console.log(data);
		var wordToTranslate = data.word;
		var results = [];
		for (var i = 0; i < languagesLocales.length; i++) {
			console.log('trying to translate word : ' + wordToTranslate + ' in locale : ' + languagesLocales[i]);
			var locale = languagesLocales[i];
			translateWord(wordToTranslate, locale, function (locale, translatedText) {
				console.log('translate text in locale : ' + locale);
				console.log('translate text : ' + translatedText);
				ttsWord(locale, translatedText, function (ttsAudioData, languageLocale, translatedText) {
					results.push({ tts : ttsAudioData, locale : languageLocale, text :  translatedText });
					if(results.length == languagesLocales.length){
						//finished
						var jsonResponse = { result : "OK", translations : results };
						socket.emit('translateResponse', jsonResponse);
					}
				});
			});
		}
	});
}

function ttsWord(locale, ttsText, callback) {
	TTS.TranslateToSpeech(locale, ttsText, callback);
}


function translateWord(wordToTranslate, locale, callback) {
    googleTranslate.translate(wordToTranslate, locale, function (err, translation) {
        if(err) {
            console.log('error translating word in locale : ' + locale);
            console.log(err);
        }
        else {
            callback(locale, translation.translatedText);
        }
    });
}