var dict = require('../../../controllers/Dictionary/DictionaryController');

var mongoose = require('mongoose');

// define the schema for our user model
var quizGameSchema = mongoose.Schema({
    MotherLanguage: String,
    Language : String,
    NumOfQuestionsAsked : Number,
    NumOfCorrectAnswered : Number,
    LastCorrectAnswer : String
});

quizGameSchema.methods.answerLastQuestion = function(answer, cb) {
    if (answer == this.LastCorrectAnswer) {
        this.NumOfCorrectAnswered++;
        this.save(function (err) {
            if (err) {
                console.log ("error in update game");
            }
            else {
                cb(true,answer);
            }
        });
    }
    else {
        cb(false,this.LastCorrectAnswer);
    }
};

// static methods
quizGameSchema.statics.findByGameId = function(id,cb)
{
    this.findOne({'_id' : id},cb);
};

quizGameSchema.statics.getQuestion = function (cb) {
    dict.getQuizGameQuestionAndAnswers(cb);
};

mongoose.model('QuizGameModel', quizGameSchema);