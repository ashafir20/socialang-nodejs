var request = require('request');
var fs = require('fs');
var streamBuffers = require("stream-buffers");

exports.HandleTTSRequests = function (socket) {
    socket.on('TTS', function (data) {
    	console.log(data);
    	TTS(data.language, data.word, function (data, locale, word) {
    		var jsonResponse = { result : "OK" , tts : data, word : word };
    		socket.emit("TTSResponse", jsonResponse);
    	});
    });

    //TTS('en', 'soccer');
 }

exports.TranslateToSpeech = function (languageLocale, word, callback) {
	TTS(languageLocale, word, callback);
}

//private function
 function TTS(languageLocale, word, callback) {

	var url = "http://translate.google.com/translate_tts?tl=" + languageLocale + "&q=" + word;

	console.log(url);

	var myWritableStreamBuffer = new streamBuffers.WritableStreamBuffer({
    	initialSize: (100 * 1024),      // start as 100 kilobytes.
    	incrementAmount: (10 * 1024)    // grow by 10 kilobytes each time buffer overflows.
	});

	var r = request(url, function(error, response, buffer) {
		if (!error && response.statusCode == 200) {
		    console.log("TTS OK");
		    var data = myWritableStreamBuffer.getContents().toString('base64');
            console.log('tts translation completed!');
       		callback(data, languageLocale, word);
		 } else{
		 	callback(null, languageLocale, word);
		 	console.log("TTS Failed");
		 }
	}).pipe(myWritableStreamBuffer);

 }
