var mongoose = require('mongoose');
var StudentTeacherGameModel = mongoose.model("StudentTeacher");
var Counters = mongoose.model("Counter");
var colors = require('colors');



exports.LaunchStudentTeacherGame = function (gameRoomID, callback) {
    console.log("Getting game from database by gameRoomID: " + gameRoomID);
       StudentTeacherGameModel.findByGameRoomID(gameRoomID, function (err, game){
            if(err){
                console.log("Error: could not get game from database".error);
                callback(false, null);
            }
            else if(game) {
                game.GameState = "Playing";
                game.save(function(errorSaving){
                    if(!err){
                        console.log('game saved and state is now playing!');
                        callback(true, game);
                    }
                });
            }
            else{
                console.log("Error: could not find game in database".error);
                callback(false, null);
            }
       });
}


exports.OpenStudentTeacherGame = function (player1Id, type, callback) {
    var StudentTeacherGame;
    Counters.findOneAndUpdate({ name: "studentTeacherGame" }, { $inc: { counter : 1 }}, {"new":true, upsert:true}, function (err, result) {
        if(result) {
            if(type == 'TeacherGame') {
                StudentTeacherGame = new StudentTeacherGameModel({
                GameState : "Waiting",
                GameType : type,
                GameRoomID : result.counter,
                Teacher : player1Id
            });
            }
            else {
              StudentTeacherGame = new StudentTeacherGameModel({
                GameState : "Waiting",
                GameType : type,
                GameRoomID : result.counter,
                Student : player1Id
            });  
            }
            console.log("Saving new game : " + StudentTeacherGame);
            StudentTeacherGame.save(function (error) {
                if (error) {
                    console.log("Error in saving student game to database!".error);
                    console.log(error);
                    callback(false, null);
                } else{
                    console.log("Game Saved!".silly);
                    callback(true, StudentTeacherGame);
                }
            });
        }
    });
}


exports.RemoveStudentTeacherGame = function (gameRoomID) {
    StudentTeacherGameModel.remove({ 'GameRoomID': gameRoomID }, function (error) {
        if(error){
            console.log('error removing game from database in hostQuitGameNotification'.error);
        } else{
            console.log('an open game was removed from database'.silly);
        }
    });
}

exports.ChangeRoomStatusBackToWaiting = function(gameRoomID) {
    StudentTeacherGameModel.findOne({ "GameRoomID" : gameRoomID }, function (err, game) {

        if(game) {
            game.GameState = "Waiting";
            game.save(function(errorSaving) {
                            //error Handling 
                        });
            jsonResponse = {result : 'OK'};
        }
    });
}


