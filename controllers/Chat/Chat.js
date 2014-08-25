var RoomPrefixes = {
    HeadToHead : "HTH",
    StudentTeacher : "ST",
    MemoryGame : "MG"
}

exports.ChatHandler = function (socket, io) {
	socket.on('chatMessage', function (data){
		console.log("in chatMessage");
		console.log(data);
		socket.get('gameRoomID', function (err, gameRoomID) {
		 	if(err){
		 		console.log("Error in getting the game room ID - chatting not OK");
		 	}
		 	else if(gameRoomID){
		 		if(data.GameType == "HeadToHeadQuizGame"){
			 		console.log("Recives Message: " + data.message);
			 		console.log("Emitting Message to room: " + RoomPrefixes.HeadToHead + gameRoomID);
					io.sockets.in(RoomPrefixes.HeadToHead + gameRoomID).emit("chatMessageResponse", data);
		 		} else if(data.GameType == "MemoryGame"){
			 		console.log("Recives Message: " + data.message);
			 		console.log("Emitting Message to room: " + RoomPrefixes.MemoryGame + gameRoomID);
					io.sockets.in(RoomPrefixes.MemoryGame + gameRoomID).emit("chatMessageResponse", data);
		 		} else if(data.GameType == "StudentGame" || data.GameType == "TeacherGame"){
			 		console.log("Recives Message: " + data.message);
			 		console.log("Emitting Message to room: " + RoomPrefixes.StudentTeacher + gameRoomID);
					io.sockets.in(RoomPrefixes.StudentTeacher + gameRoomID).emit("chatMessageResponse", data);
		 		}
			}
			else{
				console.log("Error in getting the game room ID - could not find gameRoomID");
			}
		});
	});
}

