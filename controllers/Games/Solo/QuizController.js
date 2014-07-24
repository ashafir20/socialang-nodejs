var mongoose = require('mongoose');
var QuizGameModel = mongoose.model("QuizGameModel");
var HeadToHeadModel = mongoose.model("HeadToHead");
var User = mongoose.model('User');
var googleTranslate = require('google-translate')('AIzaSyCMgsE-JKzD6YnXen2sEEeoT6OxteRgj24');
var colors = require('colors');


exports.startQuizGame = function (socket){
    socket.on('startNewQuizGame', function()  {
        socket.get('id',function(err, id){
            User.findById(id, function (err, user) {
                if(err){
                    console.log("error finding user by id");
                }
                else if(user){
                    var quizGame = new QuizGameModel();
                    //initialize game data
                    quizGame.MotherLanguage = user.motherLanguage;
                    quizGame.Language = user.learningLanguage;
                    quizGame.NumOfQuestionsAsked = 0;
                    quizGame.NumOfCorrectAnswered = 0;

                    //save game on data
                    quizGame.save(function(err){
                        if (err) {
                            var jsonResponse = {result : "failed"};
                        }
                        else {
                            var jsonResponse = {result : "OK"};
                        }
                        //bind game id to socket
                        socket.set('gameID', quizGame._id, function() {
                            console.log('User started quiz game'.silly);
                            socket.emit("startNewQuizGameResponse", jsonResponse);
                        });
                    });
                }
                else{
                    console.log("no user found in startNewQuizGame");
                }
            });
        });
    });


    socket.on('onQuizGameLoad', function(data) {
        socket.get('gameID',function(err,id)  {
            var jsonResponse;
            if (err) {
                console.log('failed to get game id from socket : '.silly  + err);
                jsonResponse = { result : 'Failed', message : 'error on server'};
                socket.emit('onLoadAnswer',jsonResponse);
            }
            else {
                console.log('Obtained gameID from socket : '.silly + id);
                QuizGameModel.findByGameId(id,function(err,game) {
                    if (err) {
                        console.log("Failed to find gameID in database : ".silly + err);
                    }
                    if (game) {
                        console.log("Successful to get QuizGame form databse : ".silly);
                        jsonResponse = { result : 'OK', language : game.Language};
                        socket.emit('onLoadAnswer',jsonResponse);
                    }
                });
            }
        });
    });


    socket.on('getQuizQuestion', function() {
        console.log('in getQuizQuestion'.silly);
        socket.get('gameID',function (err,GameId) {
            var jsonResponse;
            if (err) {
                console.log('failed to get game id from socket.'.silly);
                jsonResponse = { result : 'Failed', message : 'error on server'};
                socket.emit('onQuestion',jsonResponse);
            }
            if (GameId){
                console.log("Successful to get gameID form socket : ".silly);
                QuizGameModel.findByGameId(GameId,function(err,game) {
                    if (err) {
                        console.log("Failed to find gameID in database : ".silly + err);
                        jsonResponse = {result : 'Failed'};
                        socket.emit('onQuestion', jsonResponse);
                    }
                    if (game)
                    {
                        console.log("Successful to get QuizGame form databse : ".silly);
                        QuizGameModel.getQuestion(function(wordsArray) {
                            console.log("WORD ARRAY WE GOT  : ".silly + wordsArray);
                            googleTranslate.translate(wordsArray[0], 'es', function(err, translation) {
                                if (err) {
                                    console.log("error in translate : ".silly + err);
                                    jsonResponse = { result : 'Failed' };
                                    socket.emit('onQuestion',jsonResponse);
                                }
                                else {
                                    QuizGameModel.update({_id : GameId},
                                        {NumOfQuestionsAsked : game.NumOfQuestionsAsked + 1,LastCorrectAnswer : wordsArray[0]}
                                        ,function (err, numberAffecte) {
                                            if (err) {
                                                console.log("ERROR UPDATE GAMEQUIZ" + err);
                                            }
                                            wordArray = shuffle(wordsArray);
                                            jsonResponse = { result : 'OK', Q : translation.translatedText , A1 : wordsArray[0], A2 : wordsArray[1], A3 : wordsArray[2], A4 : wordsArray[3] };
                                            socket.emit('onQuestion',jsonResponse);
                                        });
                                }
                            });
                        });
                    }});
            }
        });
    });


    function shuffle(o){ //v1.0
        for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    };


    socket.on('answerLastQuestion', function(data) {
        console.log('in answerLastQuestion with answer : '.silly  + data.answer);
        socket.get('gameID',function (err,id) {
            var jsonResponse;
            if (err) {
                console.log('failed to get game id from socket.')
                jsonResponse = { result : 'Failed', message : 'error on server'};
                socket.emit('Answer', jsonResponse);
            }
            if (id){
                console.log('Successfully got id from socket'.silly);
                QuizGameModel.findByGameId(id, function(err, game) {
                    if (err) {
                        console.log("ERORR - " + err);
                    }
                    if (game) {
                        console.log('Successfully found game in database'.silly);
                        game.answerLastQuestion(data.answer, function(isCorrect, correctAnswer) {
                            var endGame;
                            if (game.NumOfQuestionsAsked === 10){
                                endGame = true;
                                game.remove(function (err, deletedGame) {
                                    if(err) {
                                        console.log("ERROR DELETING GAME".silly);
                                    }
                                    else {
                                        console.log("DELETING GAME".silly + deletedGame);
                                    }
                                });
                            }
                            else {
                                endGame = false;
                            }

                            jsonResponse = { result : 'OK', correct : isCorrect, endGame : endGame, correctAnswer : correctAnswer};
                            socket.emit('Answer',jsonResponse);
                        });
                    }
                });
            }
        });
    });


    socket.on('endQuizGame',function () {
        socket.get('gameID',function(err,id){
            if (err){
                consol.log("error getting id from socket");
            }
            if (id){
                QuizGameModel.findByGameId(id, function(err, game) {
                    if (err)
                    {
                        consol.log("error getting gamemodel from database".silly);
                    }
                    if (game) {
                        game.remove(function (err, deletedGame) {
                            if(err) {
                                console.log("ERROR DELETING GAME".silly);
                            }
                            else {
                                console.log("DELETING GAME".silly + deletedGame);
                            }
                        });
                    }
                });
            }
        });

    });

    socket.on('restartGame', function(data) {

        /*
         send back to Answer
         json { message : OK/Failed }
         */
    });
};
