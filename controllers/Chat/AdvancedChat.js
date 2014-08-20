var mongoose = require('mongoose');
var User = mongoose.model('User');
var colors = require('colors');

//rooms
//-----------------------
//main
//spanish
//italian
//french
//hebrew
//greek
//german
//dutch
//russian


exports.HandleAdvancedChat = function (socket, io) {
	socket.on('JoinAdvancedChatRequest', function (data)
	{
		console.log("in JoinAdvancedChatRequest");
		socket.get('id', function (err, id) 
		{
			if(id){
				User.findById(id, function (error, user) {
					if(user) {
						console.log('found user!'.blue);
						socket.join('main');
						//store the room name in the socket session for this client
						socket.set('room', 'main');
						var fullname = user.firstName + " " + user.lastName;

						var jsonResponse = { 
							 result: 'OK', 
							 sender : 'SERVER',
							 message : 'Welcome ' + fullname,
							 date : '05:13'
							};

						socket.emit('advancedChatMessage', jsonResponse);

						jsonResponse = { 
							result: 'OK',
						    sender : 'SERVER', message :  fullname + ' has connected to this room',
						    date : '12:22' 
						};

						socket.broadcast.to('main').emit('advancedChatMessage', jsonResponse);
					}
				});
			}
		});
	});

	socket.on('GetAdvancedChatOnlineUsers', function () {
		var users = io.sockets.clients('main');
		var onlineusers = [];
		for (var socketId in io.sockets.sockets) 
		{
			getUserDetails(socketid, function (userDetails) {
				onlineusers.push();
			});
		}
	});

	function getUserDetails(socketid, callback){
	    io.sockets.sockets[socketId].get('id', function (err, userid) {
        if(userid){
        	User.findById(id, function (error, user) {
	        		if(user) {
	        			
	        		}
	        	}
	        }
	    });
	}
}

