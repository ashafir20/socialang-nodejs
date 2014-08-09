var mongoose = require('mongoose');
var MemoryGame = mongoose.model("MemoryGame");
var Counters = mongoose.model("Counter");
var colors = require('colors');

exports.LaunchMemoryGame = function (gameRoomID, callback) {
       console.log("Getting game from database by gameRoomID: " + gameRoomID);
       MemoryGame.findByGameRoomID(gameRoomID, function (err, game){
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
            else {
                console.log("Error: could not find game in database".error);
                callback(false, null);
            }
       });

}


exports.RemoveGame = function (gameRoomID) {
    MemoryGame.remove({ 'GameRoomID': gameRoomID }, function (error) {
        if(error){
            console.log('error removing game from database in hostQuitGameNotification'.error);
        } else{
            console.log('an open game was removed from database'.silly);
        }
    });
}

exports.SetGameState = function (gameRoomID, gameState) {
    MemoryGame.findByGameRoomID(gameRoomID, function (err, game){
            if(err) {
                console.log("Error: could not get game from database".error);
            }
            else if(game) {
                game.GameState = gameState;
                game.save(function(errorSaving){
                    if(!err){
                        console.log('game saved and state is now waiting!');
                    }
                });
            }
            else {
                console.log("Error: could not find game in database".error);
            }
       });
}

exports.StartGame = function (player1Id, callback) {
    Counters.findOneAndUpdate({ name: "MemoryGame" }, { $inc: { counter : 1 }}, {"new":true, upsert:true}, function (err, result) {
        if(result) {
            var memoryGame = new MemoryGame({
                GameState : "Waiting",
                GameRoomID : result.counter,
                Player1 : player1Id
            });

            console.log("Saving new game : " + memoryGame);

            memoryGame.save(function (error) {
                if (error) {
                    console.log("Error in saving new memory game to database!".error);
                    console.log(error);
                    callback(false, null);
                } else{
                    console.log("new memory game created and saved!".silly);
                    callback(true, memoryGame);
                }
            });
        }
    });
}




/*exports.RemoveHeadToHeadGame = function (gameRoomID) {
    HeadToHeadModel.remove({ 'GameRoomID': gameRoomID }, function (error) {
        if(error){
            console.log('error removing game from database in hostQuitGameNotification'.error);
        } else{
            console.log('an open game was removed from database'.silly);
        }
    });
}

exports.StartHeadToHeadQuizGame = function (player1Id, callback) {
    Counters.findOneAndUpdate({ name: "headToHeadQuizGame" }, { $inc: { counter : 1 }}, {"new":true, upsert:true}, function (err, result) {
        if(result) {
            var headToHeadQuizGame = new HeadToHeadModel({
                GameState : "Waiting",
                GameRoomID : result.counter,
                Player1 : player1Id
            });
            console.log("Saving new game : " + headToHeadQuizGame);
            headToHeadQuizGame.save(function (error) {
                if (error) {
                    console.log("Error in saving head to head game to database!".error);
                    console.log(error);
                    callback(false, null);
                } else{
                    console.log("Game Saved!".silly);
                    callback(true, headToHeadQuizGame);
                }
            });
        }
    });
}

*/