var mongoose = require('mongoose');
var HeadToHeadModel = mongoose.model("HeadToHead");
var MemoryGameModel = mongoose.model("MemoryGame");
var StudentTeacherModel = mongoose.model("StudentTeacher");
var User = mongoose.model('User');

exports.WaitingGamesListHandler = function (socket) {
    socket.on('userGameHostsRequest', function(data) {
        console.log("in userGameHostsRequest handler");
        var jsonResponse = { 'jsonUserHosts' : [] };
        var gameType = data.GameType;
        if(gameType == 'HeadToHeadQuizGame') {
            HeadToHeadModel.GetByGameState('Waiting', function(err, gameDocs) {
                if(err){
                    console.log("error retrieving JSONHostsArray");
                    jsonResponse = { result : "Failed" };
                    socket.emit('userGameHostsResponse', jsonResponse);
                }
                else {
                    var hosts = [];
                    if(gameDocs){
                        for(var i = 0 ; i < gameDocs.length ; i++){
                            hosts.push({ host : gameDocs[i].Player1, GameRoomID : gameDocs[i].GameRoomID });
                        }
                    }
                    jsonResponse = { result : "OK" , jsonUserHosts : hosts};
                    socket.emit("userGameHostsResponse", jsonResponse);
                }
            });
        }
        if(gameType == 'MemoryGame') {
            MemoryGameModel.GetByGameState('Waiting', function(err, gameDocs) {
                if(err){
                    console.log("error retrieving JSONHostsArray");
                    jsonResponse = { result : "Failed" };
                    socket.emit('userGameHostsResponse', jsonResponse);
                }
                else {
                    var hosts = [];
                    if(gameDocs){
                        for(var i = 0 ; i < gameDocs.length ; i++){
                            hosts.push({ host : gameDocs[i].Player1, GameRoomID : gameDocs[i].GameRoomID });
                        }
                    }
                    jsonResponse = { result : "OK" , jsonUserHosts : hosts};
                    socket.emit("userGameHostsResponse", jsonResponse);
                }
            });
        }
        else if(gameType == 'StudentTeacher') {
            StudentTeacherModel.GetStudentsGamesByGameState('Waiting', function(err, gameDocs) {
                if(err){
                    console.log("error retrieving JSONHostsArray");
                    jsonResponse = { result : "Failed" };
                    socket.emit('studentsGameHostsResponse', jsonResponse);
                }
                else {
                    var studentsHosts = [];
                    if(gameDocs){
                        for(var i = 0 ; i < gameDocs.length ; i++){
                            studentsHosts.push({ host : gameDocs[i].Student, GameRoomID : gameDocs[i].GameRoomID });
                        }
                    }
                    jsonResponse = { result : "OK" , jsonUserHosts : studentsHosts };
                    socket.emit('studentsGameHostsResponse', jsonResponse);
                }
            });

            StudentTeacherModel.GetTeachersGamesByGameState('Waiting', function(err, gameDocs) {
                if(err){
                    console.log("error retrieving JSONHostsArray");
                    jsonResponse = { result : "Failed" };
                    socket.emit('teachersGameHostsResponse', jsonResponse);
                }
                else {
                    var teachersHosts = [];
                    if(gameDocs){
                        for(var i = 0 ; i < gameDocs.length ; i++){
                            teachersHosts.push({ host : gameDocs[i].Teacher, GameRoomID : gameDocs[i].GameRoomID });
                        }
                    }
                    jsonResponse = { result : "OK" , jsonUserHosts :  teachersHosts };
                    socket.emit('teachersGameHostsResponse', jsonResponse);
                }
            });

        }
    });
}
