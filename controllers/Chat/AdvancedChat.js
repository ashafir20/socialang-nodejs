var mongoose = require('mongoose');
var User = mongoose.model('User');
var colors = require('colors');
var moment = require('moment');

var rooms = ['Spanish', 'Italian', 'French', 'Hebrew', 'Greek', 'German', 'Dutch', 'Russian'];

exports.HandleAdvancedChat = function (socket, io) {
	socket.on('JoinAdvancedChatRequest', function (data) {
		console.log("in JoinAdvancedChatRequest");
		socket.get('id', function (err, id) {
			if(id){
				User.findById(id, function (error, user) {
					if(user) {
						socket.join(rooms[0]);
						//store the room name in the socket session for this client
						socket.room = rooms[0];
						var fullname = user.firstName + " " + user.lastName;

						var jsonResponse = { 
							 result: 'OK', 
							 sender : 'SERVER',
							 message : 'Welcome to the ' + rooms[0] + ' Room ' + fullname,
							 date : moment().format("h:mm:ss")
						};

						socket.emit('advancedChatMessage', jsonResponse);

						jsonResponse = { 
							result: 'OK',
						    sender : 'SERVER',
						    message :  fullname + ' has connected!',
						    date : moment().format("h:mm:ss")
						};

					  socket.broadcast.to(rooms[0]).emit('advancedChatMessage', jsonResponse);


					  var newConnectedUserDetails = {
	        			 'learningLanguage' : user.learningLanguage,
	        			 'firstName' :  user.firstName,
	        			 'lastName' :  user.lastName,
	        			 'profileid' : user.profileid
	        			};

	        			var jsonResponse = { result : "OK", 'user' : newConnectedUserDetails , 'method' : "ADD" };
	        			socket.broadcast.to(rooms[0]).emit('advancedChatOnlineUsersUpdate', jsonResponse);
					}
				});
			}
		});
	});

	socket.on('advancedChatMessage', function (message) {
		console.log("in advancedChatMessage");
		socket.get('id', function (err, id) {
			if(id){
				User.findById(id, function (error, user) {
					if(user) {
						var fullname = user.firstName + " " + user.lastName;
						var jsonResponse = { 
							'result' : 'OK',
						    'sender' : fullname,
						    'message' :  message,
						    'date' : moment().format("h:mm:ss")
						};
					   io.sockets.in(socket.room).emit('advancedChatMessage', jsonResponse);
					}
				});
			}
		});
	});

	socket.on('AdvancedChatSwitchRoom', function (data) {
		console.log("in AdvancedChatSwitchRoom");
		var newroom = data.room;
		socket.get('id', function (err, id) {
			if(id) {
				User.findById(id, function (error, user) {
					if(user) 
					{
						var fullname = user.firstName + " " + user.lastName;
						// leave the current room (stored in session)
						socket.leave(socket.room);
						// join new room, received as function parameter
						socket.join(newroom);

						var jsonResponse = { 
							 result: 'OK', 
							 sender : 'SERVER',
							 message : 'you have connected to '+ newroom + ' room!',
							 date : moment().format("h:mm:ss")
						};

						socket.emit('advancedChatMessage', jsonResponse);
						// sent message to OLD room
						
						jsonResponse = { 
							result: 'OK',
						    sender : 'SERVER',
						    message :  fullname + ' has left this room!',
						    date : moment().format("h:mm:ss")
						};

						socket.broadcast.to(socket.room).emit('advancedChatMessage', jsonResponse);

						// update socket session room title
						socket.room = newroom;

						jsonResponse = { 
							result: 'OK',
						    sender : 'SERVER',
						    message :  fullname + ' has joined this room!',
						    date : moment().format("h:mm:ss")
						};

						socket.broadcast.to(newroom).emit('advancedChatMessage', jsonResponse);
					}
				});
			}
		});
	});

	socket.on('GetAdvancedChatOnlineUsers', function () {
		socket.get('id', function (err, currentUserId) {
			var onlineusers = [];
			var clientInRoom = io.sockets.clients(socket.room);
			console.log(clientInRoom.length + ' clients in room'.silly);
			for (var i = 0; i < clientInRoom.length; i++) {
				getUserDetails(clientInRoom[i], currentUserId, function (userDetails) {
					console.log(userDetails);
					onlineusers.push(userDetails);
					if(onlineusers.length == clientInRoom.length) {
						var jsonResponse = { result : "OK", onlineUsers : onlineusers };
						socket.emit('GetAdvancedChatOnlineUsersResponse' , jsonResponse);
					}
				});
			};	
		});
	});

	socket.on('GetAdvancedChatOnlineUsersStats', function () {
		socket.get('id', function (err, currentUserId) {
			getStats(function (stats) {
				var jsonResponse = { result : "OK", 'stats' : stats };
				socket.emit('GetAdvancedChatOnlineUsersStatsResponse' , jsonResponse);
			});
		});
	});


	function getStats(callback) {
		var stats = [];
		for (var i = 0; i < rooms.length; i++) {
			var clientsInRoom = io.sockets.clients(rooms[i]);
			console.log(clientsInRoom.length + ' clients in room ' + rooms[i]);
			var room =  rooms[i];
			var stat = { 
				'room' : room,
				'numOfClients' : clientsInRoom.length, 
			}

			stats.push(stat);
		}

		callback(stats);
	}

	socket.on('leaveAdvancedChatRequest', function () {
		console.log("in leaveAdvancedChatRequest".silly);
		socket.get('id', function (err, id) {
			if(id) {
				User.findById(id, function (error, user) {
					if(user) 
					{
						var fullname = user.firstName + " " + user.lastName;
						// leave the current room (stored in session)
						socket.leave(socket.room);

						var jsonResponse = { 
							result: 'OK',
						    sender : 'SERVER',
						    message :  fullname + ' has left this room!',
						    date : moment().format("h:mm:ss")
						};

						socket.broadcast.to(socket.room).emit('advancedChatMessage', jsonResponse);

					  var userToRemove = {
	        			 'learningLanguage' : user.learningLanguage,
	        			 'firstName' :  user.firstName,
	        			 'lastName' :  user.lastName,
	        			 'profileid' : user.profileid
	        			};

	        			var jsonResponse = { result : "OK", 'user' : userToRemove , 'method' : "REMOVE" };
	        			socket.broadcast.to(rooms[0]).emit('advancedChatOnlineUsersUpdate', jsonResponse);
					}
				});
			}
		});
	});


	function getUserDetails(clientInRoom, currentUserId, callback) {
		console.log('in getUserDetails'.silly);
	    clientInRoom.get('id', function (err, userid) {
	    	User.findById(userid, function (error, user) {
        		if(user) {
        			var result = {
        			 'learningLanguage' : user.learningLanguage,
        			 'firstName' :  user.firstName,
        			 'lastName' :  user.lastName,
        			 'profileid' : user.profileid 
        			};

        			callback(result);
        		}
	        });
	  });
	}
}

