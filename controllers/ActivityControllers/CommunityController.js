var mongoose = require('mongoose');
var colors = require('colors');
var User = mongoose.model('User');
var Counters = mongoose.model("Counter");

exports.CommunityHandler = function(socket, io) {

    socket.on('friendsRequest', function () {   //Get The Users Friends List
        socket.get('id', function (err, userId) {
            if(userId) {
                getFriendsByUserId(userId, socket);
            }
        });
    });

    socket.on('messagesRequest', function () {
        socket.get('id', function (err, userId) {
            if(userId) {
                getMessagesByUserId(userId, socket);
            }
        });
    });

    socket.on('unfriendRequest', function(data) {
        socket.get('id', function (err, userId) {
            if(userId) {
                deleteFriend(userId, data, socket);
            }
        });
    });

    socket.on('sendNewMessageRequest', function(data) {
        socket.get('id', function (err, userId) {
            if(userId) {
                console.log('in community sendNewMessageRequest');
                putMessageToReciver(userId, data, socket);
            }
        });
    });

    socket.on('deleteMessageRequest', function(data) {
        socket.get('id', function (err, userId) {
            if(userId) {
                deleteMessage(userId, data, socket);
            }
        });
    });

    socket.on('isFriendsRequest', function(data) {
        socket.get('id', function (err, userId) {
            if(userId) {
                findIfFriends(userId, data, socket);
            }
        });
    });

    socket.on('onlineUsersRequest', function() {
        socket.get('id', function (err, userId) {
            if(userId) {
                getOnlineUsers(io, userId, socket);
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

    socket.on('friendsRequestsListRequest', function(data) {
        socket.get('id', function (err, userId) {
            if(userId) {
                getFriendsRequestListByUserId(userId, socket);
            }
        });
    });

    socket.on('ignoreFriendRequest', function(data) {
        socket.get('id', function (err, userId) {
            if(userId) {
                ignoreFriendRequest(userId, data, socket);
            }
        });
    });

    socket.on('acceptFriendRequest', function(data) {
        socket.get('id', function (err, userId) {
            if(userId) {
                acceptFriendRequest(userId, data, socket);
            }
        });
    });

    //Chat Related
    socket.on('addUserToCommunityChat', function(data) {
        socket.join("communitychat");
    });

    socket.on('removeUserFromCommunityChat', function(data) {
        socket.leave("communitychat");
    });

    socket.on('communityChatMessage', function(data) {
        console.log("Recives Message: " + data.message);
        io.sockets.in("communitychat").emit("newCommunityChatMessage", data);
    });
}

function acceptFriendRequest(userId, data, socket) {
/*    User.findById(userId, function(errorid, currentUser) {
        if(!errorid){
            if(data.facebookUser == "true") {
                User.findOne({ "profileid" : data.profileid }, function (err, user) {

                    if(user) {
                        currentUser.friends.addToSet(user._id);
                        currentUser.friendsRequests.remove(user._id);
                        currentUser.save(function(errorSaving) {
                            //error Handling 
                        });
                        user.friends.addToSet(currentUser._id);
                        user.save(function(errorSaving) {
                            //error Handling 
                        });
                        jsonResponse = {result : 'OK'};
                        socket.emit('acceptFriendRequestRespone', jsonResponse);
                    }
                });
            }
            else {
                User.findOne({ "username" : data.username }, function (err, user) {

                    if(user) {
                        currentUser.friends.addToSet(user._id);
                        currentUser.friendsRequests.remove(user._id);
                        currentUser.save(function(errorSaving) {
                            //error Handling 
                        });
                        user.friends.addToSet(currentUser._id);
                        user.save(function(errorSaving) {
                            //error Handling 
                        });
                        jsonResponse = {result : 'OK'};
                        socket.emit('acceptFriendRequestRespone', jsonResponse);
                    }
                });
            }

        }
    });*/
}

function ignoreFriendRequest(userId, data, socket) {
    User.findById(userId, function(errorid, currentUser) {
        if(!errorid){
            if(data.facebookUser == "true") {
                User.findOne({ "profileid" : data.profileid }, function (err, user) {

                    if(user) {
                        currentUser.friendsRequests.remove(user._id);
                        currentUser.save(function(errorSaving) {
                            //error Handling 
                        });
                        jsonResponse = {result : 'OK'};
                        socket.emit('ignoreFriendRespone', jsonResponse);
                    }
                });
            }
            else {
                User.findOne({ "username" : data.username }, function (err, user) {

                    if(user) {
                        currentUser.friendsRequests.remove(user._id);
                        currentUser.save(function(errorSaving) {
                            //error Handling 
                        });
                        jsonResponse = {result : 'OK'};
                        socket.emit('ignoreFriendRespone', jsonResponse);
                    }
                });
            }

        }
    });
}


function getFriendsRequestListByUserId(userId, socket) {
    User.GetFriendsRequestsList(userId, function (error, user) {
        if(error){
            console.log("error getting friends".error);
            console.log(error);
        }
        else if(user)
        {

            console.log(user);
            jsonResponse = {result : 'OK', friendsRequestList : user.friendsRequests};
            socket.emit('friendsRequestsListRespone', jsonResponse);


        }else{
            console.log("could not find user by id".error);
        }
    });
}


function putFriendRequestToReciver(userId, data, socket) {
/*    User.findById(userId, function(errorid, currentUser) {
        if(!errorid){
            if(data.facebookUser == "true") {
                User.findOne({ "profileid" : data.profileid }, function (err, user) {
                    if(user) {
                        user.friendsRequests.addToSet(currentUser._id); //Unique Adding
                        // user.friendsRequests.push(user._id);
                        user.save(function(error) {
                            if(error) {
                                throw Error(error);
                            }
                            else {
                                console.log('Friend Request Was Recived And Updated In The Reciver');
                            }
                        });
                        jsonResponse = {result : 'OK'};
                        socket.emit('friendRequestRespone', jsonResponse);
                    }
                });
            }
            else {
               User.findOne({ "username" : data.username }, function (err, user) {
                if(user) {
                    user.friendsRequests.addToSet(currentUser._id); //Unique Adding
                    // user.friendsRequests.push(user._id);
                    user.save(function(error) {
                        if(error) {
                            throw Error(error);
                        }
                        else {
                            console.log('Friend Request Was Recived And Updated In The Reciver');
                        }
                    });
                    jsonResponse = {result : 'OK'};
                    socket.emit('friendRequestRespone', jsonResponse);
                }
            }); 
           }
       }
   });*/
}



function getOnlineUsers(io, userId, socket) {
    var onlineUsers = [];
    console.log('in getOnlineUsers');
    var inserted = 0;
    var clients = io.sockets.clients(); //all connected clients
    for (var i = 0; i < clients.length; i++) 
    {
        console.log(clients[i].id);
        clients[i].get('id', function (err, userid)
        {
            if(userid)
            {
                User.findById(userid, function (error, user) 
                {
                    if(user) 
                    {
                        onlineUsers.push(user);
                        if(++inserted == clients.length)
                        {
                            var jsonResponse = { 'result' : 'OK', 'onlineUsersArray' : onlineUsers };
                            socket.emit('onlineUsersResponse', jsonResponse);
                        }
                    }
                });
            }
        });
    }

/*    User.find({ "online" : true}, function (err, usersOnlineArray) {
        if(usersOnlineArray) {
            jsonResponse = {result : 'OK', onlineUsersArray : usersOnlineArray};
            socket.emit('onlineUsersResponse', jsonResponse);
        }
    });*/
        
}

function findIfFriends(userId, data, socket) {
    var isFriends = false;
    User.findById(userId, function(errorid, currentUser) {
        if(!errorid){
            if(data.facebookUser == "true") {
                User.findOne({ "profileid" : data.profileid }, function (err, user) {
                    if(user) {
                        for (var i = 0 ; i <  currentUser.friends.length ; i++) {
                            if(currentUser.friends[i].toString() === user._id.toString()) {
                                isFriends = true;
                                break;
                            }
                        };
                    }
                    console.log("Is Friends : " + isFriends);
                    jsonResponse = {result : 'OK', isFriends : isFriends};
                    socket.emit('isFriendsRespone', jsonResponse);
                });
            }
            else {
                User.findOne({ "username" : data.username }, function (err, user) {
                    if(user) {
                        for (var i = 0 ; i <  currentUser.friends.length ; i++) {
                            if(currentUser.friends[i].toString() === user._id.toString()) {
                                isFriends = true;
                                break;
                            }
                        };
                    }
                    console.log("Is Friends : " + isFriends);
                    jsonResponse = {result : 'OK', isFriends : isFriends};
                    socket.emit('isFriendsRespone', jsonResponse);
                });
            }
        }
    });
}

function deleteMessage(userId, data, socket){
    console.log(data);
    User.update(
        { _id: userId },
        { $pull: {messages: { messageId: data.msgid } } },
        function (error, val) {
            if(error){
                console.log(error);
                jsonResponse = {result : 'Failed'};
                socket.emit('deleteMessageResponse', jsonResponse);
            } else{
                console.log(val);
                jsonResponse = {result : 'OK'};
                socket.emit('deleteMessageResponse', jsonResponse);
            }
        });
}


function putMessageToReciver(userId, data, socket){
/*    User.findById(userId, function (errorid, currentUser) {
        if(!errorid){
            if(data.facebookUser == "true") {
                User.findOne({ "profileid" : data.profileid }, function (err, user) {
                    Counters.findOneAndUpdate({ name: "messagesCounter" }, { $inc: { counter : 1 }}, {"new":true, upsert:true}, function (err, result) {
                        if(user) {
                        var message = {
                            subject : data.subject,
                            content : data.content,
                            date : new Date(),
                            messageId : result.counter,
                            sender : currentUser._id
                        };
                        user.messages.push(message);
                        user.save(function(errorSaving) {
                            //error Handling 
                        });
                        jsonResponse = {result : 'OK'};
                        socket.emit('sendMessageConfirmationResponse', jsonResponse);
                      }
                    });
                });
            }
            else {  //Regular User
                User.findOne({ "username" : data.username }, function (err, user) {
                    Counters.findOneAndUpdate({ name: "messagesCounter" }, { $inc: { counter : 1 }}, {"new":true, upsert:true}, function (err, result) {
                        if(user) {
                        var message = {
                            subject : data.subject,
                            content : data.content,
                            date : new Date(),
                            messageId : result.counter,
                            sender : currentUser._id
                        };
                        user.messages.push(message);
                        user.save(function(errorSaving) {
                            //error Handling 
                        });
                        jsonResponse = {result : 'OK'};
                        socket.emit('sendNewMessageResponse', jsonResponse);
                    }
                    });
                });
            }
        }
    });*/
}


function deleteFriend(userId, data, socket){
    var userToDeleteID;
    User.findById(userId, function(errorid, currentUser) {
        if(!errorid){
            if(data.facebookUser == "true") {
                User.findOne({ "profileid" : data.profileid }, function (err, user) {

                    if(user) {
                        currentUser.friends.remove(user._id);
                        currentUser.save(function(errorSaving) {
                            //error Handling 
                        });
                        user.friends.remove(currentUser._id);
                        user.save(function(errorSaving) {
                            //error Handling 
                        });
                        jsonResponse = {result : 'OK'};
                        socket.emit('unfriendResponse', jsonResponse);
                    }
                });
            }
            else {
                User.findOne({ "username" : data.username }, function (err, user) {

                    if(user) {
                        currentUser.friends.remove(user._id);
                        currentUser.save(function(errorSaving) {
                            //error Handling 
                        });
                        user.friends.remove(currentUser._id);
                        user.save(function(errorSaving) {
                            //error Handling 
                        });
                        jsonResponse = {result : 'OK'};
                        socket.emit('unfriendResponse', jsonResponse);
                    }
                });
            }

        }
    });
}


function getMessagesByUserId(userId, socket){
    User.GetMessages(userId, function (error, user) {
        if(error){
            console.log("error getting friends".error);
            console.log(error);
        }
        else if(user){
            jsonResponse = {result : 'OK', messages : user.messages};
            socket.emit('messageListResponse', jsonResponse);
        }else{
            console.log("could not find user by id".error);
        }
    });
}

function getFriendsByUserId(userId, socket){
    User.GetFriends(userId, function (error, user) {
        if(error){
            console.log("error getting friends".error);
            console.log(error);
        }
        else if(user){
            console.log(user);
            jsonResponse = {result : 'OK', friends : user.friends};
            socket.emit('friendsListResponse', jsonResponse);
        }else{
            console.log("could not find user by id".error);
        }
    });
}


exports.test = function () { 
     // User.findById('539093a4ed9845d801292136', function (err, aviv){
     //     if(!err) {
     //          aviv.friends.push('539093a4ed9845d801292136');
     //          aviv.save(function(error){
     //             if(err) throw Error(error);
     //             console.log('aviv saved with new friend');
     //         });
     //     }
     // });

     // User.findById('5374d80c8c10b1581d8ca818', function (err, aviv){
     //     if(!err) {
     //          aviv.friends.push('5374d80404307ac80e7bc816');
     //          aviv.save(function(error){
     //             if(err) throw Error(error);
     //             console.log('aviv saved with new friend');
     //         });
     //     }
     // });



    // var message = {
    //     subject : "Hey Daniel!",
    //     content : "Whats Up?",
    //     date : new Date(),
    //     sender : '536665a6d95a1fd4250e0fd8' //aviv
    // };


    // User.findById('536665a6d95a1fd4250e0fd8', function (err, daniel){
    //     if(!err) {
    //         console.log(message);
    //         daniel.messages.push(message);
    //         daniel.save(function(errorSaving) {
    //         if(!errorSaving){
    //             //getMessagesByUserId(daniel._id);
    //         }
    //     });
    //     }
    // });
}


  

