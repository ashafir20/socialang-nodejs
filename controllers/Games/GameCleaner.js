var mongoose = require('mongoose');
var HeadToHeadModel = mongoose.model("HeadToHead");
var MemoryGameModel = mongoose.model("MemoryGame");
var QuizGameModel = mongoose.model("QuizGameModel");
var StudentTeacherModel = mongoose.model("StudentTeacher");
var colors = require("colors");
var moment = require('moment');

exports.CleanGames = function () {
    console.log('inside CleanAbandonedGamesHandler');

    var minutes = 1, the_interval = minutes * 60 * 1000; // 60 seconds interval

    //test
    //var minutes = 1, the_interval = minutes * 10 * 1000;

    //lets remove games
    setInterval(function() {
          console.log('cleaning abandoned games'.green);
          HeadToHeadModel.find({}, { dateCreated: 1, GameRoomID: 1, _id: 0 }, function  (err, docs) {
               if (err) return console.log(err);
                if (!docs || !Array.isArray(docs) || docs.length === 0) 
                  return console.log('no abandoned h2h games found'.green);

                console.log('there are currently : ' + docs.length + " h2h games in collection");
                console.log('iterating over h2h games creation dates'.green);

                docs.forEach(function (doc) {
                  console.log(doc);
                  var timeCreated = doc.dateCreated;
                  console.log('game created at : ' + moment(timeCreated).format("dddd, MMMM Do YYYY, h:mm:ss a"));

                  var nowTime = moment();
                  console.log('now is : ' + moment(nowTime).format("dddd, MMMM Do YYYY, h:mm:ss a"));
                  var diffFromNow = moment(timeCreated).diff(nowTime, 'seconds');   

                  console.log('diffFromNow is : ' + diffFromNow);

                  var maxDelta = 50 * 60 //5 minute (300 seconds) max per game
                  console.log('the delta is set at: ' + maxDelta + " seconds");

                    if(Math.abs(nowTime - diffFromNow) > maxDelta) {
                        console.log('found an abandoned! removing it...'.green);
                        console.log('GameRoomID is : ' + doc.GameRoomID);
                          HeadToHeadModel.remove({ 'GameRoomID' : doc.GameRoomID }, function (error) {
                          if(error){
                              console.log('error removing game from database in hostQuitGameNotification'.error);
                          } else{
                              console.log('an abandoned game was removed from database'.green);
                          }
                      });
                    }
                });
          });
    }, the_interval ); //1 minute

    //on server restart remove all playing games...
/*    mongoose.connection.db.dropCollection("headtoheads", function(err, result) {
          if(!err) console.log('removed HeadToHead collection');
    });
    mongoose.connection.db.dropCollection("memorygames", function(err, result) {
           if(!err) console.log('removed MemoryGame collection');
    });
    mongoose.connection.db.dropCollection("studentteachers", function(err, result) {
           if(!err) console.log('removed StudentTeacher collection');
    });*/

}

