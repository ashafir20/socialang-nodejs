var mongoose = require('mongoose');
var User = mongoose.model('User');
var MemoryGameModel = mongoose.model("MemoryGame");
var HeadToHeadModel = mongoose.model("HeadToHead");
var Levels = require('../../Levels.js').Levels;
var LevelPointsMap = require('../../Levels.js').LevelPointsMap;

exports.HomeActivityHandler = function(socket) {

    socket.on('userInHomeActivity', function() {
        console.log('in userInHomeActivity');
         socket.get('id', function (err, id) {
            if(id) {
                MemoryGameModel.findOne({ 'Player1' : id }, function (err, game) {
                    if(game){
                        game.remove(function (err) {
                           if(!err) console.log('memory game removed');
                        });
                    }
                });
                HeadToHeadModel.findOne({ 'Player1' : id }, function (err, game) {
                    if(game){
                        game.remove(function (err) {
                           if(!err) console.log('head to head game removed');
                        });
                    }
                });
            }
         });
     });



    socket.on('languageLearnUpdate', function(userLanguage) {
        var jsonResponse;
        socket.get('id', function (err, id) {
            if(err)
            {
                console.log("Error: could not get user id from socket");
                jsonResponse = { result : "Failed" };
                socket.emit("languageUpdateResponse", jsonResponse);
            }
            else if(id)
            {
                console.log('main activity for id  :' + id);
                User.findById(id, function(errorid, user) {
                    if (errorid){
                        console.log("Error: could not find user in database");
                        jsonResponse = { result : "Failed" };
                        socket.emit("languageUpdateResponse", jsonResponse);
                    }
                    else {
                        user.learningLanguage = userLanguage.language;
                        user.save(function(error) {
                            if(!error) {
                                console.log("user language was updated with language " + user.learningLanguage);
                                jsonResponse = { result : "OK" };
                            }
                            else {
                                console.log("Error: could update user language");
                                jsonResponse = { result : "Failed" };
                            }
                            socket.emit("languageUpdateResponse", jsonResponse);
                        });
                    }
                });
            }
        });
    });


    socket.on('ProfileDetailsRequest', function () {
        var jsonResponse;
        socket.get('id', function (err, id) {
            if(err){
                console.log("Error: could not get user id from socket");
                jsonResponse = { result : "Failed" };
                socket.emit("ProfileDetailsResponse", jsonResponse);
            }
            else if(id) {
                User.GetUserFull(id, function (errorid, user) {
                    if (errorid) {
                        console.log("Error: could not find user in database");
                        jsonResponse = { result : "Failed" };
                        socket.emit("ProfileDetailsResponse", jsonResponse);
                    }
                    else {

                        var nextLevel = getNextLevel(user.learningLanguage , user.stats);
                        var currPoints = getCurrentLanguagePoints(user.learningLanguage , user.stats);
                        var pointsTilNextLevel = LevelPointsMap[nextLevel] - currPoints;

                        jsonResponse =  { 
                                    result : "OK",
                                    language :  user.learningLanguage,
                                    pointsToNextLevel : pointsTilNextLevel,
                                    currentPoints : currPoints,
                                    friends : user.friends,
                                    messages: user.messages,
                                    stats : user.stats
                             };

                        socket.emit("ProfileDetailsResponse", jsonResponse);
                    }
                });
            }
        });
    });
}

function getNextLevel(currentLanguage, UserStats){
    console.log(UserStats);
    console.log(currentLanguage);
    for(var i in UserStats){
        if(UserStats[i].language === currentLanguage) {
            console.log("found language in user stats. calling helper...");
            return getNextLevelHelper(UserStats[i].level);
        }
    }

    throw new Error("could not find current language in getNextLevel function");
}

function getNextLevelHelper (currentLevel){
    console.log(Levels);
    console.log("current user level : " + currentLevel);
    for(var i = 0; i < Levels.length - 1; i++) {
        if(currentLevel === Levels[i]) {
            var indexOfNextLevel = i + 1;
            console.log("returning the level at index: " + indexOfNextLevel);
            console.log("returning the level: " + Levels[indexOfNextLevel]);
            return Levels[indexOfNextLevel];
        }
    }
    

    console.log("user is in the last level returning same level..");
    return currentLevel; //return the same level if its the last level
}


function getCurrentLanguagePoints(currentLanguage, UserStats){
    for(var i in UserStats) {
        if(UserStats[i].language === currentLanguage) {
            return UserStats[i].points;
        }
    }

    throw new Error("could not find current language points of user");
}