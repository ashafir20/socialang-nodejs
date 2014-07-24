var mongoose = require('mongoose');
var User = mongoose.model('User');

var Levels = require('../../Levels.js').Levels;
var Languages = require('../../Languages.js').Languages;

exports.Signup = function (socket) {
    socket.on('SignupRequest',function(userData) {
        console.log('got signup request with userData : ' + userData.username + " " + userData.password);
        User.findOne({ username: userData.username }, function (err, user) {
            var jsonResponse;
            if (err) {
                console.log("Error trying to find username in database : " + err);
                jsonResponse = {result : "Failed"};
                socket.emit("RegisterResponse",jsonResponse);
            }
            else if (user) {
                console.log("Username in use");
                jsonResponse = {result : "Failed"};
                socket.emit("RegisterResponse",jsonResponse);
            }
            else  { 
                var newUser = new User({
                    username: userData.username, password: userData.password,
                    firstName : userData.firstName, lastName : userData.lastName,
                    isFacebookUser : false, learningLanguage : userData.learningLanguage
                });

                for(var index in Languages) {
                    newUser.stats.push({  points: 0, level: Levels[0], language: Languages[index] });
                }

                newUser.save(function(error){
                    if(error){
                        console.log("unknown error when adding new user");
                        jsonResponse = {result : "Failed"};
                    }
                    else {
                        jsonResponse = {result : "OK"};
                    }
                    socket.emit("RegisterResponse",jsonResponse);
                });
            }
        });
    });

    socket.on('checkUniqueUsernameRequest',function(userData) {
        console.log('checking username unique : : ' + userData.username);
        var jsonResponse;
        User.findOne({ 'username' : userData.username }, function (err, user) {
            if(err){
                console.log('checkUniqueUsernameRequest error');
                jsonResponse = {result : 'Failed', isUsernameUnique : false };
                socket.emit("RegisterResponse", jsonResponse);
            }
            else if(user){
                console.log('username is not unique');
                jsonResponse = {result : 'OK', isUsernameUnique : false };
                socket.emit("RegisterResponse", jsonResponse);
            }
            else{
                console.log('username is unique');
                jsonResponse = {result : 'OK', isUsernameUnique : true };
                socket.emit("RegisterResponse", jsonResponse);
            }
        });
    });
};






