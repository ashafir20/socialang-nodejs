var mongoose = require('mongoose');
var User = mongoose.model("User");

//GetUserDetailsRequest
//GetUserDetailsResponse

exports.HandlerUserDetailsRequests = function (socket) {
    socket.on('GetUserDetailsRequest', function (data) {
        var uniqueid = data.UserUniqueId;
        console.log('in GetUserDetailsRequest');
        console.log(data);
        var jsonResponse =  {};
        if(uniqueid == null || uniqueid == 'undefined') {
            jsonResponse = { 'result' : 'Failed' };
            socket.emit('GetUserDetailsResponse', jsonResponse);
        } else {
             User.findOne({ 'uniqueId': Number(uniqueid) }, function (err, user) {
                  if (err) console.log('could not find user in collection!'.error);
                  else if(user) {
                     jsonResponse = { 'result' : 'OK', 'user' : user };
                     socket.emit('GetUserDetailsResponse', jsonResponse);
                  }
             });
        }
    });


    socket.on('syncUser', function (data) {
        var uniqueUserId = data.uniqueId;
        console.log('in syncUser with uniqueUserId : ' + uniqueUserId);
        User.findOne({ 'uniqueId': Number(uniqueUserId) }, '_id', function (err, user) {
          if (err) console.log('could not find user in collection!'.error);
          else if(user) {
             console.log('found user! setting in socket for sync!');
             socket.set('id', user._id, function () {
                console.log('id was set in socket!');
             });
          } else {
             console.log('no user was found in collection');
          }
        });
    });
}