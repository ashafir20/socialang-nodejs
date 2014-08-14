var mongoose = require('mongoose');
var HeadToHeadModel = mongoose.model("HeadToHead");
var MemoryGameModel = mongoose.model("MemoryGame");
var StudentTeacherModel = mongoose.model("StudentTeacher");
var User = mongoose.model('User');
var colors = require('colors');
var HeadToHeadQuizInit = require('./HeadToHead/HeadToHeadQuizInit');
var MemoryGameInit = require('./MemoryGame/MemoryGameInit');
var StudentTeacherGameInit = require('./StudentTeacherGame/StudentTeacherGameInit');

var RoomPrefixes = {
    HeadToHead : "HTH",
    StudentTeacher : "ST",
    MemoryGame : "MG"
}

var Errors = {
    DifferentLanguage = "DifferentLanguage"
}

exports.GamesRoomRoutesHandler = function (socket, io) {
    socket.on('gameLaunchRequest', function (req) {
        var jsonResponse;
        getVariableFromSocket('gameRoomID' , function(gameRoomID){
            if(req.GameType == 'HeadToHeadQuizGame') {
                HeadToHeadQuizInit.LaunchHeadToHeadQuizGame(gameRoomID ,function (initSuccess, game){
                    if(initSuccess) {
                        jsonResponse = { result : "OK" , 'Player1' : game.Player1, 'Player2' : game.Player2 };
                    } else {
                        jsonResponse = { result : "Failed" };
                    }
                    console.log(" Emitting to players at room : " + RoomPrefixes.HeadToHead + gameRoomID + " ".silly);
                    io.sockets.in(RoomPrefixes.HeadToHead + gameRoomID).emit('gameLaunchedRoomResponse', jsonResponse);
                });
            }
            else if(req.GameType == 'TeacherGame') {
                StudentTeacherGameInit.LaunchStudentTeacherGame(gameRoomID ,function (initSuccess, game){
                    if(initSuccess) {
                        jsonResponse = { result : "OK" , Teacher : game.Teacher, Student : game.Student };
                    } else {
                        jsonResponse = { result : "Failed" };
                    }
                    console.log(" Emitting to players at room : " + RoomPrefixes.StudentTeacher + gameRoomID + " ".silly);
                    io.sockets.in(RoomPrefixes.StudentTeacher + gameRoomID).emit('gameLaunchedRoomResponse', jsonResponse);
                });
            }
            else if(req.GameType == 'StudentGame') {
                StudentTeacherGameInit.LaunchStudentTeacherGame(gameRoomID ,function (initSuccess, game){
                    if(initSuccess) {
                        jsonResponse = { result : "OK" , Student : game.Student, Teacher : game.Teacher };
                    } else {
                        jsonResponse = { result : "Failed" };
                    }
                    console.log(" Emitting to players at room : " + RoomPrefixes.StudentTeacher + gameRoomID + " ".silly);
                    io.sockets.in(RoomPrefixes.StudentTeacher + gameRoomID).emit('gameLaunchedRoomResponse', jsonResponse);
                });
            }
            else if(req.GameType == 'MemoryGame') {
                MemoryGameInit.LaunchMemoryGame(gameRoomID ,function (initSuccess, game){
                    if(initSuccess) {
                        jsonResponse = { result : "OK" , 'Player1' : game.Player1, 'Player2' : game.Player2 };
                    } else {
                        jsonResponse = { result : "Failed" };
                    }
                    console.log(" Emitting to players at room : " + RoomPrefixes.MemoryGame + gameRoomID + " ".silly);
                    io.sockets.in(RoomPrefixes.MemoryGame + gameRoomID).emit('gameLaunchedRoomResponse', jsonResponse);
                });
            }
        });
    });


    socket.on('startGameRequest', function (req) {
        var jsonResponse;
        getVariableFromSocket("id", function(player1Id){
            if(req.GameType == 'HeadToHeadQuizGame')
            {
                HeadToHeadQuizInit.StartHeadToHeadQuizGame(player1Id ,function (startSuccess, headToHeadQuizGame){
                   if(startSuccess) {
                        console.log("setting new game room id : " + headToHeadQuizGame.GameRoomID + " to user socket".silly);
                        socket.set('gameRoomID', headToHeadQuizGame.GameRoomID);
                        socket.join(RoomPrefixes.HeadToHead + headToHeadQuizGame.GameRoomID);
                        jsonResponse = { result: "OK" };
                    } else {
                        jsonResponse = { result : "Failed" };
                    }
                    socket.emit("startNewGameResponse", jsonResponse);
                });
            }
            else if(req.GameType == 'MemoryGame') {
                MemoryGameInit.StartGame(player1Id, function (startSuccess, MemoryGame){
                   if(startSuccess) {
                        console.log("setting new game room id : " + MemoryGame.GameRoomID + " to user socket".silly);
                        socket.set('gameRoomID', MemoryGame.GameRoomID);
                        socket.join(RoomPrefixes.MemoryGame + MemoryGame.GameRoomID);
                        jsonResponse = { result: "OK" };
                    } else {
                        jsonResponse = { result : "Failed" };
                    }
                    socket.emit("startNewGameResponse", jsonResponse);
                });
            }
             //Handling Requests For Student/Teacher Game
            else if(req.GameType == 'TeacherGame') {
                StudentTeacherGameInit.OpenStudentTeacherGame(player1Id, "TeacherGame", function (startSuccess, TeacherGame){
                    if(startSuccess) {
                        console.log("setting new game room id : " + TeacherGame.GameRoomID + " to user socket".silly);
                        socket.set('gameRoomID', TeacherGame.GameRoomID);
                        socket.join(RoomPrefixes.StudentTeacher + TeacherGame.GameRoomID);
                        jsonResponse = { result: "OK" };
                    } else {
                        jsonResponse = { result : "Failed" };
                    }
                    socket.emit("startNewTeacherGameRespone", jsonResponse);

                });
                
            }
            else if(req.GameType == 'StudentGame') {
                StudentTeacherGameInit.OpenStudentTeacherGame(player1Id, "StudentGame", function (startSuccess, StudentGame){
                    if(startSuccess) {
                        console.log("setting new game room id : " + StudentGame.GameRoomID + " to user socket".silly);
                        socket.set('gameRoomID', StudentGame.GameRoomID);
                        socket.join(RoomPrefixes.StudentTeacher + StudentGame.GameRoomID);
                        jsonResponse = { result: "OK" };
                    } else {
                        jsonResponse = { result : "Failed" };
                    }
                    socket.emit("startNewStudentGameRespone", jsonResponse);

                });
            }
         });
    });

    socket.on('GuestQuitGameNotification', function (req){
        console.log('inside GuestQuitGameNotification.'.silly);
        console.log(req);
        getVariableFromSocket('gameRoomID', function (gameRoomID) {
            if(req.GameType == 'HeadToHeadQuizGame') {
                HeadToHeadQuizInit.SetGameState(gameRoomID, "Waiting");
                jsonResponse = { result: "OK" };
                socket.broadcast.to(RoomPrefixes.HeadToHead + gameRoomID).emit('playerQuitGameNotificationResponse', jsonResponse);
            } 
            else if(req.GameType == 'MemoryGame') {
                MemoryGameInit.SetGameState(gameRoomID, "Waiting");
                jsonResponse = { result: "OK" };
                socket.broadcast.to(RoomPrefixes.MemoryGame + gameRoomID).emit('playerQuitGameNotificationResponse', jsonResponse);
            }
            else if(req.GameType == 'StudentGame') {
                jsonResponse = { result: "OK" };
                StudentTeacherGameInit.ChangeRoomStatusBackToWaiting(gameRoomID);
                socket.broadcast.to(RoomPrefixes.StudentTeacher + gameRoomID).emit('playerQuitGameNotificationResponse', jsonResponse);
            }
            else if(req.GameType == 'TeacherGame') {
                jsonResponse = { result: "OK" };
                StudentTeacherGameInit.ChangeRoomStatusBackToWaiting(gameRoomID);
                socket.broadcast.to(RoomPrefixes.StudentTeacher + gameRoomID).emit('playerQuitGameNotificationResponse', jsonResponse);
            }
        });
    });


    socket.on('HostQuitGameNotification', function (req){
        console.log('inside HostQuitGameNotification. removing game from database...'.silly);
        getVariableFromSocket('gameRoomID', function (gameRoomID) {
            if(req.GameType == 'HeadToHeadQuizGame') {
                HeadToHeadQuizInit.RemoveGame(gameRoomID);
                jsonResponse = { result: "OK"};
                socket.broadcast.to(RoomPrefixes.HeadToHead + gameRoomID).emit('playerQuitGameNotificationResponse', jsonResponse);
            }
            else if(req.GameType == 'MemoryGame') {
                MemoryGameInit.RemoveGame(gameRoomID);
                jsonResponse = { result: "OK"};
                socket.broadcast.to(RoomPrefixes.MemoryGame + gameRoomID).emit('playerQuitGameNotificationResponse', jsonResponse);
            }
            else if(req.GameType == 'StudentGame') {
                StudentTeacherGameInit.RemoveStudentTeacherGame(gameRoomID);
                jsonResponse = { result: "OK" };
                socket.broadcast.to(RoomPrefixes.StudentTeacher + gameRoomID).emit('playerQuitGameNotificationResponse', jsonResponse);
            }
            else if(req.GameType == 'TeacherGame') {
                StudentTeacherGameInit.RemoveStudentTeacherGame(gameRoomID);
                jsonResponse = { result: "OK" };
                socket.broadcast.to(RoomPrefixes.StudentTeacher + gameRoomID).emit('playerQuitGameNotificationResponse', jsonResponse);
            }
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


    socket.on('joinGameRequest', function (req) {
        console.log('request to join room : ' + req.GameRoomID);
        getVariableFromSocket('id', function(player2Id) {
             if(req.GameType == 'HeadToHeadQuizGame')  {
                  HeadToHeadModel.findByGameRoomID(req.GameRoomID, function (err, headToHeadGame) {
                    if(headToHeadGame) {
                        console.log('FOUND GAME: : '.silly + headToHeadGame);
                        socket.set('gameRoomID', headToHeadGame.GameRoomID);
                        var roomid = RoomPrefixes.HeadToHead + headToHeadGame.GameRoomID;
                        socket.join(roomid);
                        headToHeadGame.Player2 = player2Id;
                        headToHeadGame.GameState = "Ready";
                        headToHeadGame.save(function(errorSavingGame) {
                            if (!errorSavingGame) {
                                console.log("Game was saved to database.".silly);
                            }
                        });

                        User.findById(player2Id, function (errorFindingUser, player2) {
                            if (errorFindingUser) {
                                console.log("Could not find user by id in database in joinHeadToHeadQuizGameRequest".error);
                            }
                            else if (player2) {
                                console.log("Got player2 details from database: " + player2);
                                console.log("emitting to clients on room : ".silly + RoomPrefixes.HeadToHead + headToHeadGame.GameRoomID);
                                 var jsonResponse = {};
                                if(player2.learningLanguage != headToHeadGame.Player1.learningLanguage){
                                    jsonResponse = { result: "OK", Player1: headToHeadGame.Player1, Player2: player2 };
                                }
                                else{
                                    jsonResponse = { result: "Failed", Error : Errors.DifferentLanguage };
                                }
                                 io.sockets.in(RoomPrefixes.HeadToHead + headToHeadGame.GameRoomID).emit('playerJoinedGameResponse', jsonResponse);
                            }
                            else{
                                 console.log("Player2 was not found in database.".error);
                            }
                        });    
                    }
                });
            }
            else if(req.GameType == 'MemoryGame')  {
                  MemoryGameModel.findByGameRoomID(req.GameRoomID, function (err, memoryGame) {
                    if(memoryGame) {
                        console.log('FOUND GAME: : '.silly + memoryGame);
                        socket.set('gameRoomID', memoryGame.GameRoomID);
                        var roomid = RoomPrefixes.MemoryGame + memoryGame.GameRoomID;
                        socket.join(roomid);

                        memoryGame.Player2 = player2Id;
                        memoryGame.GameState = "Ready";

                        memoryGame.save(function(errorSavingGame) {
                            if (!errorSavingGame) {
                                console.log("memory game was saved to database.".silly);
                            }
                        });

                        User.findById(player2Id, function (errorFindingUser, player2) {
                            if (errorFindingUser) {
                                console.log("Could not find user by id in database in joinGameRequest".error);
                            }
                            else if (player2) {
                                console.log("Got player2 details from database: " + player2);
                                console.log("emitting to clients on room : ".silly + RoomPrefixes.MemoryGame + memoryGame.GameRoomID);
                                var jsonResponse = { result: "OK", Player1: memoryGame.Player1, Player2: player2 };
                                io.sockets.in(RoomPrefixes.MemoryGame + memoryGame.GameRoomID).emit('playerJoinedGameResponse', jsonResponse);
                            }
                            else{
                                 console.log("Player2 was not found in database.".error);
                            }
                        });    
                    }
                });
            }
            else if(req.GameType == 'StudentGame') {
                    StudentTeacherModel.findByGameRoomID(req.GameRoomID, function (err, studentGame) {
                    if(studentGame) {
                        console.log('FOUND GAME: : '.silly + studentGame);
                        socket.set('gameRoomID', studentGame.GameRoomID);
                        var roomid = RoomPrefixes.StudentTeacher + studentGame.GameRoomID;
                        socket.join(roomid);
                        studentGame.Teacher = player2Id;
                        studentGame.GameState = "Ready";
                        studentGame.save(function(errorSavingGame) {
                            if (!errorSavingGame) {
                                console.log("Game was saved to database.".silly);
                            }
                        });

                        User.findById(player2Id, function (errorFindingUser, Teacher) {
                            if (errorFindingUser) {
                                console.log("Could not find user by id in database in joinStudentGameRequest".error);
                            }
                            else if (Teacher) {
                                console.log("Got Teacher details from database: " + Teacher);
                                console.log("emitting to clients on room : ".silly + RoomPrefixes.StudentTeacher + studentGame.GameRoomID);
                                var jsonResponse = { result: "OK", Player1: studentGame.Student, Player2: Teacher };
                                io.sockets.in(RoomPrefixes.StudentTeacher + studentGame.GameRoomID).emit('teacherJoinedStudentGameResponse', jsonResponse);
                            }
                            else{
                                 console.log("Teacher was not found in database.".error);
                            }
                        });    
                    }
                });
            }
            else if(req.GameType == 'TeacherGame') {
                StudentTeacherModel.findByGameRoomID(req.GameRoomID, function (err, teacherGame) {
                    if(teacherGame) {
                        console.log('FOUND GAME: : '.silly + teacherGame);
                        socket.set('gameRoomID', teacherGame.GameRoomID);
                        var roomid = RoomPrefixes.StudentTeacher + teacherGame.GameRoomID;
                        socket.join(roomid);
                        teacherGame.Student = player2Id;
                        teacherGame.GameState = "Ready";
                        teacherGame.save(function(errorSavingGame) {
                            if (!errorSavingGame) {
                                console.log("Game was saved to database.".silly);
                            }
                        });

                        User.findById(player2Id, function (errorFindingUser, Student) {
                            if (errorFindingUser) {
                                console.log("Could not find user by id in database in joinStudentGameRequest".error);
                            }
                            else if (Student) {
                                console.log("Got Student details from database: " + Student);
                                console.log("emitting to clients on room : ".silly + RoomPrefixes.StudentTeacher + teacherGame.GameRoomID);
                                var jsonResponse = { result: "OK", Player2: Student, Player1: teacherGame.Teacher };
                                io.sockets.in(RoomPrefixes.StudentTeacher + teacherGame.GameRoomID).emit('studentJoinedTeacherGameResponse', jsonResponse);
                            }
                            else{
                                 console.log("Student was not found in database.".error);
                            }
                        });    
                    }
                });
            }
        });
    });



}
