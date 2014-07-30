var RoomPrefixes = {
    HeadToHead : "HTH",
    StudentTeacher : "ST",
    MemoryGame : "MG"
}

exports.ChatHandler = function (socket, io) {

	socket.on("addUserToChat", function (data) {
		console.log("in addUserToChat function");
		console.log(data);
		socket.get('gameRoomID', function (err, gameRoomID) {
		 	if(err){
		 		console.log("Error in getting the game room ID - chatting not OK");
		 	} else if(gameRoomID) { 
		 		console.log("Found game room id, chatting - OK");
		 		if(data.GameType == "HeadToHeadQuizGame") {
	 				socket.join("chat" + RoomPrefixes.HeadToHead + gameRoomID);
		 		} else if(data.GameType == "MemoryGame") {
		 			socket.join("chat" + RoomPrefixes.MemoryGame + gameRoomID);
		 		}
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
		 		if(data.GameType == "HeadToHeadQuizGame"){
			 		console.log("Recives Message: " + data.message);
			 		console.log("Emitting Message to room: " + "chat" + RoomPrefixes.HeadToHead + gameRoomID);
					io.sockets.in("chat" + RoomPrefixes.HeadToHead + gameRoomID);
		 		} else if(data.GameType == "MemoryGame"){
			 		console.log("Recives Message: " + data.message);
			 		console.log("Emitting Message to room: " + "chat" + RoomPrefixes.MemoryGame + gameRoomID);
					io.sockets.in("chat" + RoomPrefixes.MemoryGame + gameRoomID).emit("newChatMessage", data);
		 		}
			}
			else
			{
				console.log("Error in getting the game room ID - could not find gameRoomID");
			}
		});
	});
}

