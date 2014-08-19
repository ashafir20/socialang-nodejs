var mongoose = require('mongoose');
var User = mongoose.model('User');
var colors = require('colors');
var Levels = require('../../Levels.js').Levels;
var Languages = require('../../Languages.js').Languages;

exports.LoginFacebook = function (socket) {
    socket.on('FacebookLoginRequest', function(userFacebookData) {
        var jsonResponse;
        console.log('got facebook login request with userData : ' 
            + userFacebookData.profileid + " " + userFacebookData.firstName + " " + userFacebookData.lastName);

        User.findOne({'profileid': userFacebookData.profileid },
            function (err,user) {
                if (err) {
                    console.log('Error Retrieving user by id');
                    jsonResponse = { result : 'Failed' };
                    socket.emit("LoginResponse", jsonResponse);
                }
                else if(user) {
                    socket.set('id', user._id, function() {
                        console.log('set user on socket with id : '+ user._id);
                        jsonResponse = { result : 'OK', User : user };
                        socket.emit("LoginResponse", jsonResponse);

                        user.SaveAsConnected(true);
                    });
                } 
                else
                {
                    var newUser = new User ({
                            profileid: userFacebookData.profileid,
                            firstName : userFacebookData.firstName,
                            lastName : userFacebookData.lastName,
                            isFacebookUser : true
                    });

                    for (var i = 0; i < Languages.length; i++) {
                        newUser.stats.push({  points: 0, level: Levels[0], language: Languages[i] });
                    };
                    
                    newUser.save(function(error) {
                        if (error) {
                            console.log("Failed in saving new user : " + error);
                            jsonResponse = { result : 'Failed' };
                            socket.emit("LoginResponse", jsonResponse);
                        }
                        else {
                            socket.set('id', newUser._id, function() {
                               console.log('set user on socket with id : '+ newUser._id);
                               jsonResponse = { result : 'OK', User : newUser };
                               socket.emit("LoginResponse", jsonResponse);
                               
                               newUser.SaveAsConnected(true);
                            });
                        }
                    });
                }
            });
    });
};

