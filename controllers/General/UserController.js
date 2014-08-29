var mongoose = require('mongoose');
var User = mongoose.model("User");
var colors = require("colors");
var Counters = mongoose.model("Counter");

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
    socket.on('sendNewMessageRequest', function (message) 
    {
        console.log(message);
        socket.get('id', function (err, senderid) 
        {
            if(senderid)  
            {
              User.findById(senderid, function (errorSender, sender) 
              {
                  if(sender) 
                  {
                     User.findOne({ "uniqueId" : message.uniqueId }, function (err, reciever)
                     {
                        //update counter for messages collection
                        Counters.findOneAndUpdate({ name: "messagesCounter" }, { $inc: { counter : 1 }}, {"new":true, upsert:true}, function (err, result) 
                        {
                            var newmessage = {
                                subject : message.subject,
                                content : message.content,
                                date : new Date(),
                                messageId : result.counter,
                                sender : sender._id
                            };

                            reciever.messages.push(newmessage);
                            reciever.save(function (errorSaving) {
                                if(!errorSaving) console.log('saved user with message');
                            });

                            jsonResponse = {result : 'OK'};
                            socket.emit('sendMessageConfirmationResponse', jsonResponse);

                            var allConnectedSockets = io.sockets.clients(); //all connected sockets
                            for (var i = 0; i < allConnectedSockets.length; i++) {
                              sendNewMessageRequestHelper(allConnectedSockets[i], message.uniqueId , function (usersSocket) {
                                  if(usersSocket) {
                                      var jsonResponse = { 'result' : "OK", "message" : newmessage, 'senderUser': sender };
                                      usersSocket.emit('newMessageNotification', jsonResponse);
                                  }
                              });
                            }
                        });
                     });
                  }
              });
            }
          });
      });  

    setInterval(function()
    {
          var clients = io.sockets.clients(); //all connected sockets
          for (var i = 0; i < clients.length; i++) 
          {
                clients[i].get('id', function (err, id)
                {
                    if(id)
                    {
                      User.findById(id, function (error, user) 
                      {
                        if(user)
                        {
                          user.online = true;
                          user.save();
                        }
                      });
                    }
                });
           }
    }, 10000); //every 10 seconds we refresh the online users
    

    function sendNewMessageRequestHelper (client, uniqueId, callback){
        client.get('id', function (err, id) {
          if(id) {
            console.log('trying to find user with id: ' + id + "".silly);
            User.findById(id, function (error, user) {
                if(user && user.uniqueId == Number(uniqueId)) {
                    console.log('found the online reciever! lets send him a message');
                    callback(client);
                } 
                else {
                    callback(null);
                }
            });
         }
      });
    }
}


