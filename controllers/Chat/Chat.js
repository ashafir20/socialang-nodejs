exports.ChatHandler = function (socket, io) {
	socket.on("addUserToChat", function () {
		console.log("in addUserToChat function");
		socket.get('gameRoomID', function (err, gameRoomID) {
		 	if(err){
		 		console.log("Error in getting the game room ID - chatting not OK");
		 	}else if(gameRoomID){
		 		console.log("Found game room id, chatting - OK");
		 		socket.join("chat" + gameRoomID);
		 	}
		 	else{
		 		console.log("Error in getting the game room ID - could not find gameRoomID");
		 	}
		 });
	});
		
	socket.on('message', function (data){
		console.log(data);
		socket.get('gameRoomID', function (err, gameRoomID) {
		 	if(err)
		 	{
		 		console.log("Error in getting the game room ID - chatting not OK");
		 	}
		 	else if(gameRoomID)
		 	{
		 		console.log("Recives Message: " + data.message);
		 		console.log("Emitting Message to room: " + "chat" + gameRoomID);
				io.sockets.in("chat" + gameRoomID).emit("newChatMessage", data);
			}
			else
			{
				console.log("Error in getting the game room ID - could not find gameRoomID");
			}
		});
	});
}

