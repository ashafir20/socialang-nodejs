var mongoose = require('mongoose');
var User = mongoose.model("User");
var colors = require("colors");
var Counters = mongoose.model("Counter");
var moment = require('moment');

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
        } 
        else 
        {
          socket.get('id', function (errorid, currUser) {
            if(currUser){
               User.findOne({ 'uniqueId': Number(uniqueid) }, function (err, user) {
                    if (err) console.log('could not find user in collection!'.error);
                    else if(user) {
                       var areFriends = checkIfFriends(currUser, user);
                       jsonResponse = { 'result' : 'OK', 'user' : user, 'areFriends' : areFriends };
                       socket.emit('GetUserDetailsResponse', jsonResponse);
                    }
               });
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

    


    socket.on('friendRequest', function(data) { //FriendShip Request
        socket.get('id', function (err, userId) {
            if(userId) {
                putFriendRequestToReciver(userId, data, socket);
            }
        });
    });

    socket.on('acceptFriendRequest', function(data) {
        socket.get('id', function (err, userId) {
            if(userId) {
                acceptFriendRequest(userId, data.uniqueId , socket);
            }
        });
    });



function putFriendRequestToReciver(userId, data, socket) {
    User.findById(userId, function(errorid, currentUser) 
    {
        if(errorid) {
          console.log('error in finding user'.error);
          throw Error(errorid);
        }
        else if(currentUser)
        {
            User.findOne({ "uniqueId" : data.uniqueId }, function (err, reciever) {
              if(err) {
                console.log('error in finding friend'.error);
                throw Error(err);
              }
              else if(reciever) {
                    reciever.friendsRequests.addToSet(currentUser._id); //Unique Adding
                    reciever.save(function(error) {
                        if(error) {
                            jsonResponse = {result : 'Failed'};
                            socket.emit('friendRequestRespone', jsonResponse);
                            throw Error(error);
                        }
                        else {
                            console.log('Friend Request Was Recived And Updated In The Reciver'.green);
                            jsonResponse = {result : 'OK'};
                            socket.emit('friendRequestRespone', jsonResponse);


                            trySendNotificationIfConnected(currentUser, reciever.uniqueId, trySendNewFriendRequestHelper);

                        }
                    });
                }
            });
        }
   });
}


    function trySendNewFriendRequestHelper(client, recieversUniqueId, sender){
      client.get('id', function (err, id) {
          if(id) {
            console.log('trying to find user with id: ' + id + "".silly);
            User.findById(id, function (error, user) {
                if(user && user.uniqueId == Number(recieversUniqueId)) {
                    console.log('found the online reciever! lets send him a friend request notification');
                    var jsonResponse = { 'result' : "OK", 'sender': sender };
                    client.emit('newFriendRequestNotification', jsonResponse);
                } 
            });
          }
        });
    }



   function tryFriendRequestAprrovalHelper(client, requesterUniqueId, approver){
       client.get('id', function (err, id) {
          if(id) {
            console.log('trying to find user with id: ' + id + "".silly);
            User.findById(id, function (error, user) {
                if(user && user.uniqueId == Number(requesterUniqueId)) {
                    console.log('found the online friend requester! lets send him a friend request approval notification');
                    var jsonResponse = { 'result' : "OK", 'approver': approver };
                    client.emit('friendRequestAccepted', jsonResponse);
                } 
            });
          }
        });
   }

    function trySendNotificationIfConnected(sender, recieversUniqueId, func){
          var allConnectedSockets = io.sockets.clients(); //all connected sockets
          for (var i = 0; i < allConnectedSockets.length; i++) {
              func(allConnectedSockets[i], recieversUniqueId, sender);
          }
    }


   function acceptFriendRequest(userId, uniqueId, socket) {
      User.findById(userId, function(errorid, currentUser) {
          if(currentUser){
              User.findOne({ "uniqueId" : uniqueId }, function (err, requester) {
                  if(requester) {
                        currentUser.friends.addToSet(requester._id);
                        currentUser.friendsRequests.remove(requester._id);
                        currentUser.save(function(errorSaving) {
                            if(!errorSaving) console.log('saved approver with a new friend');
                        });
                        requester.friends.addToSet(currentUser._id);
                        requester.save(function(errorSaving) {
                            if(!errorSaving) console.log('saved requester with a new friend');
                        });

                        //to the user that approved
                        jsonResponse = {result : 'OK'};
                        socket.emit('acceptFriendRequestRespone', jsonResponse);

                         //to the user that sent the request
                        trySendNotificationIfConnected(currentUser, requester.uniqueId, tryFriendRequestAprrovalHelper);
                    }
                });
              }
      });
    }



    //catching the same emit key as community controller -> community only saves message to reciever user document
    //this function is for online messaging
    socket.on('sendNewMessageRequest', function (message) 
    {
        console.log(message);
        socket.get('id', function (err, senderid) 
        {
            if(senderid)  
            {
              User.GetFriends(senderid, function (errorSender, sender) 
              {
                  if(sender) 
                  {
                     User.findOne({ 'uniqueId' : message.uniqueId }, function (errorUser, reciever)
                     {
                        //update counter for messages collection
                        if(reciever)
                        {
                            Counters.findOneAndUpdate({ name: "messagesCounter" }, { $inc: { counter : 1 }}, {"new":true, upsert:true}, function (err, result) 
                            {
                                var areFriends = checkIfFriends(sender, reciever);

                                console.log('---------------------------'.green);
                                console.log('are friends : ' + areFriends);
                                console.log('message counter : ' + result.counter);

                                var newmessage = {
                                    subject : message.subject,
                                    content : message.content,
                                    date : new Date(),
                                    messageId : result.counter,
                                    sender : sender._id,
                                    friends : areFriends
                                };

                                reciever.messages.push(newmessage);
                                reciever.save(function (errorSaving, newmessage) {
                                    if(errorSaving) {
                                      console.log('---------------------------'.error);
                                      console.log('error saving new message to reciever'.error);
                                    }
                                    else {
                                      console.log('saved user with a new message'.green);
                                      console.log(newmessage);
                                    }
                                });

                                jsonResponse = {result : 'OK'};
                                socket.emit('sendMessageConfirmationResponse', jsonResponse);

                                var allConnectedSockets = io.sockets.clients(); //all connected sockets
                                for (var i = 0; i < allConnectedSockets.length; i++) {
                                  sendNewMessageRequestHelper(allConnectedSockets[i], message.uniqueId , function (usersSocket) {
                                      if(usersSocket) {
                                          newmessage.date = moment().format("h:mm:ss");
                                          var jsonResponse = { 'result' : "OK", "message" : newmessage, 'senderUser': sender };
                                          usersSocket.emit('newMessageNotification', jsonResponse);
                                      }
                                  });
                                }
                            });
                          }
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
    


    function checkIfFriends(user1, user2) {
        if (!user1.friends || !Array.isArray(user1.friends) || user1.friends.length === 0) {
          console.log('no friends found'.green);
          return false;
        }

        console.log(user1.friends);

        for (var i = 0; i < user1.friends.length; i++) {
            console.log('printing all friends uniqueid values : '.green);
            console.log(user1.friends[i].uniqueId);
            if(user1.friends[i].uniqueId == user2.uniqueId){
              return true;
            }
        }

        return false;
    }

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


