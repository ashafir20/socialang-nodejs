var mongoose = require('mongoose');
var StudentTeacherGameModel = mongoose.model("StudentTeacher");
var StudentTeacherGameInit = require('./StudentTeacherGameInit');
var colors = require('colors');

var RoomPrefix = "ST";

exports.StudentTeacherGameHandler = function(socket, io) {
    socket.on('CloseActiveStudentTeacherGame', function () {
        console.log('inside StudentTeacherGameHandler. on CloseActiveStudentTeacherGame removing active game from database...'.silly);
        getVariableFromSocket('gameRoomID', function (gameRoomID) {
            StudentTeacherGameInit.RemoveStudentTeacherGame(gameRoomID);
            jsonResponse = { result: "OK" };
            socket.broadcast.to(RoomPrefix + gameRoomID).emit('ActiveStudentTeacherGameClosed', jsonResponse);
        });
    }); 

    socket.on('AudioFile', function(data) {
        getVariableFromSocket('gameRoomID', function (gameRoomID) {
            var jsonResponse = {audio : data.audio}
            socket.broadcast.to(RoomPrefix + gameRoomID).emit('audioFileResponse', jsonResponse);
        });
        
    });

    socket.on('showImage', function(data) {
        getVariableFromSocket('gameRoomID', function (gameRoomID) {
            var jsonResponse = {image : data.url, word : data.word}
            io.sockets.in(RoomPrefix + gameRoomID).emit('showImageResponse', jsonResponse);
        });
        
    });

    function getVariableFromSocket(key, callback) {
        socket.get(key, function (err, key) {
            console.log(key);
            if(err){
                 console.log(err);
                 console.log("Error: could not get " + key + " from socket".error);
            } else {
                callback(key);
            }
        });
    }   
}

