var mongoose = require('mongoose');
var User = mongoose.model('User');

exports.Login = function(socket) {
    socket.on('LoginRequest',function(data) {
        var jsonResponse;
        console.log('user ' + data.username + ' sent login request with password ' + data.password );
        User.findOne({ "username" : data.username, "password" : data.password }, function (err, user) {
            if(err){
                console.log('Error Retrieving user by username');
                jsonResponse = { result : 'Failed' };
                socket.emit("LoginResponse", jsonResponse);
            }
            else if(user){
                socket.set('id', user._id, function() {
                    console.log('set user on socket with id : '+ user._id);
                    jsonResponse = { result : 'OK', User : user };
                    socket.emit("LoginResponse", jsonResponse);

                    user.SaveAsConnected(true);

                });
            }
            else{
                console.log('no user on found in database');
                jsonResponse = { result : 'Failed', Log : "No Such User"};
                socket.emit("LoginResponse", jsonResponse);
            }
        });
    });
};
