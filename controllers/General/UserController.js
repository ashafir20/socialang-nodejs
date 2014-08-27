var mongoose = require('mongoose');
var User = mongoose.model("User");
var colors = require("colors");

//GetUserDetailsRequest
//GetUserDetailsResponse

exports.HandlerUserDetailsRequests = function (socket, io) {
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

    



    //catching the same emit key as community controller -> community only saves message to reciever user document
    //this function is for online messaging
/*    socket.on('sendNewMessageRequest', function (data) {
       console.log(data);
        socket.get('id', function (err, senderid) {
            if(senderid) 
            {
                console.log('in UserController sendNewMessageRequest');
                var allConnectedSockets = io.sockets.clients();
                for (var i = 0; i < allConnectedSockets.length; i++) 
                {
                    console.log(allConnectedSockets[i].id);
                    if(allConnectedSockets[i].id)
                    {
                      findUserForThisSocket(allConnectedSockets[i], allConnectedSockets[i].id, function (reciever, recieversSocket)
                      {
                          if(reciever)
                          {
                            sendNotificationToUser(reciever, recieversSocket, data);
                          }
                      });
                    }

                    allConnectedSockets[i].get('id',function (errorid, id) {
                       findUserForThisSocket(allConnectedSockets[i], id);
                    });
                    
                }
            }
        });
    });


    function sendNotificationToUser(reciever, recieversSocket, data) {
        console.log(reciever + "".green);
        console.log(data + + "".green);
    }

    function findUserForThisSocket(recieverSocket, id, callback) {
        console.log('trying to find user with id: ' + id + "".silly);
        User.findById(id, function (error, user) 
        {
            if(user && user.online && user.uniqueId == Number(data.uniqueId))
            {
                console.log('found the online reciever! lets send him a message');
                callback(user);
            } 
            else
            {
                callback(null);
            }
        });
    }
*/

}


