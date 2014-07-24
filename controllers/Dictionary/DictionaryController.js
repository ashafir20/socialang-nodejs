var myDict = require('./index');
var mongoose = require('mongoose');
var googleTranslate = require('google-translate')('AIzaSyCMgsE-JKzD6YnXen2sEEeoT6OxteRgj24');
var User = mongoose.model('User');

exports.getRandomWord = function(callback)
{
    var word = myDict.word();
    callback(word);
};

function getFourWords(callback)
{
    var wordArr = [];
    wordArr[0] = myDict.word();
    wordArr[1] = myDict.word();
    wordArr[2] = myDict.word();
    wordArr[3] = myDict.word();

    callback(wordArr);

};

exports.getQuizGameQuestionAndAnswers = function (cb) 
{
    this.getRandomWord(function(word) {
        getFourWords(function (ansArr) {
            cb(ansArr);
        });
    });
};


exports.shuffle = function (o) 
{
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

var languageToLocaleDictionary = {};
languageToLocaleDictionary["Spanish"] = "es";
languageToLocaleDictionary["Hebrew"] = "he";
languageToLocaleDictionary["sp"] = "es";
languageToLocaleDictionary["he"] = "he";

exports.GetLanguageLocale = function (language) {
    return languageToLocaleDictionary[language];
};

exports.TranslateWord = function(wordToTanslate, userSocket, callback) {
    userSocket.get('id', function (err, id){
         User.findById(id, function (err, user) {
            console.log('User learning : ' + user.learningLanguage);
            var userLanguageLocale = languageToLocaleDictionary[user.learningLanguage];
            console.log('Translating word : ' + wordToTanslate + " with locale : " + userLanguageLocale);
            googleTranslate.translate(wordToTanslate, userLanguageLocale, function (err, translation) {
                if(err) {
                    console.log('error translating word');
                    console.log(err);
                    callback(err);
                }
                else {
                    console.log('translated word!');
                    callback(err, translation.translatedText);
                }
            });
         });
    }); 
};




