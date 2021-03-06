var mongoose = require('mongoose');
var User = mongoose.model('User');
var Counters = mongoose.model("Counter");
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
                socket.emit("RegisterResponse", jsonResponse);
            }
            else if (user) {
                console.log("Username in use");
                jsonResponse = {result : "OK", 'isUsernameUnique' : false };
                socket.emit("RegisterResponse", jsonResponse);
            }
            else  { 

                var firstName = userData.fullname.split(' ')[0];
                var lastName =  userData.fullname.split(' ')[1];

                ////////////////////////////////////////////
                //CREATING NEW APP USER 
                ///////////////////////////////////
                 Counters.findOneAndUpdate({ name: "User" }, { $inc: { counter : 1 }}, {"new":true, upsert:true}, function (err, result) 
                 {  
                        var newUser = new User({
                            'username': userData.username,
                            'password': userData.password,
                            'firstName' : firstName,
                            'lastName' : lastName,
                            'isFacebookUser' : false,
                            'learningLanguage' : userData.learningLanguage,
                            'uniqueId' : result.counter,
                        });

                       for (var i = 0; i < Languages.length; i++) {
                            newUser.stats.push({  points: 0, level: Levels[0], language: Languages[i] });
                        };

                        newUser.save(function (error, newUser){
                            if(error){
                                console.log("unknown error when adding new user");
                                jsonResponse = {result : "Failed"};
                            }
                            else {
                                socket.set('id', newUser._id);
                                jsonResponse = { 'result' : "OK", 'isUsernameUnique' : true, 'User' : newUser };
                            }

                            socket.emit("RegisterResponse", jsonResponse);
                        });
                });
            }
        });
    });

};






