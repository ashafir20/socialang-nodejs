var mongoose = require('mongoose');
var UserModel = require('./models/UserModel');
var HeadToHeadQuizGameModel = require('./models/Games/HeadToHeadQuizGameModel');
var StudentTeacherGameModel = require('./models/Games/StudentTeacherGameModel');
var MemoryGameModel = require('./models/Games/MemoryGameModel');
var QuizGameModel = require('./models/Games/QuizGameModel');
var CountersModel = require('./models/CountersModel');


var dburl = 'mongodb://social:inter4ever@linus.mongohq.com:10039/SocialLang';

var Grid = require('gridfs-stream');
var fs = require('fs');
var path = require('path');

Grid.mongo = mongoose.mongo;

mongoose.connect(dburl);

var conn = mongoose.createConnection(dburl);
conn.once('open', function () {

  //uncomment this if you want to store new files in gridfs
  //var gfs = Grid(conn.db);
  //UpdateGridFS(gfs);

});



function UpdateGridFS(gfs) {

	//put the files you want to store in the grid in data/images folder
	var filepaths = ['data/images/baby1.png', 'data/images/dog1.png', 'data/images/car1.png', 'data/images/house1.png'];

    saveFilesToGrid(filepaths);

    function saveFilesToGrid(filePaths) {
    	for (var i = 0; i < filePaths.length; i++) {		
	        // streaming to gridfs
	        var writestream = gfs.createWriteStream({
	            filename: path.basename(filePaths[i]),
               //this is the destination file name you want like dog.jpg
                mode: 'w'
	        });

	        fs.createReadStream(filePaths[i]).pipe(writestream);
    	};
    }
}

mongoose.connection.on('connected', function () {
    console.log('Mongoose connected to ' + dburl);
});
mongoose.connection.on('error', function (err) {
    console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose disconnected');
});
process.on('SIGINT', function () {
    mongoose.connection.close(function () {
        console.log('Mongoose disconnected through app termination');
        process.exit(0);
    });
});
