var mongoose = require('mongoose');
var HeadToHeadModel = mongoose.model("HeadToHead");
var MemoryGameModel = mongoose.model("MemoryGame");
var QuizGameModel = mongoose.model("QuizGameModel");
var StudentTeacherModel = mongoose.model("StudentTeacher");
var moment = require('moment');

exports.CleanGames = function () {
/*    var interval = setInterval(function () {
        console.log('inside CleanAbandonedGamesHandler interval');

        var diff = new Date(moment().subtract('minutes', 1).toDate().toISOString());

        console.log('diff is : ' + diff);

        MemoryGameModel.find({})
            .where('TimeCreated').lt(diff)
            .exec(RemoveGames);
        }, 30000 /* Interval is 30 seconds );*/

    //on server restart remove all playing games...
    MemoryGameModel.find({}).exec(RemoveGames);
    HeadToHeadModel.find({}).exec(RemoveGames);
    StudentTeacherModel.find({}).exec(RemoveGames);
    QuizGameModel.find({}).exec(RemoveGames);
}

function RemoveGames(gamesToRemove){
    if(gamesToRemove) {
        console.log("found " + gamesToRemove.length + " abandoned games");
        for (var i = 0; i < gamesToRemove.length; i++)  {
            console.log('A game was abandoned. trying to remove it from database');
            console.log(gamesToRemove[i]);
            gamesToRemove[i].remove(function (error) {
                if(error){
                    console.log('error removing game from database in hostQuitGameNotification'.error);
                } else{
                    console.log('an open game was removed from database');
                }
            });
        }
    }
}
