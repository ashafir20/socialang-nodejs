var mongoose = require('mongoose');
var HeadToHeadModel = mongoose.model("HeadToHead");
var MemoryGameModel = mongoose.model("MemoryGame");
var QuizGameModel = mongoose.model("QuizGameModel");
var StudentTeacherModel = mongoose.model("StudentTeacher");
//var moment = require('moment');

exports.CleanGames = function () {
    console.log('inside CleanAbandonedGamesHandler');

    //on server restart remove all playing games...
    mongoose.connection.db.dropCollection("headtoheads", function(err, result) {
          if(!err) console.log('removed HeadToHead collection');
    });
    mongoose.connection.db.dropCollection("memorygames", function(err, result) {
           if(!err) console.log('removed MemoryGame collection');
    });
    mongoose.connection.db.dropCollection("studentteachers", function(err, result) {
           if(!err) console.log('removed StudentTeacher collection');
    });

}

