var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var MemoryGameModel = mongoose.model("MemoryGame");
var colors = require('colors');
var dburl = 'mongodb://social:inter4ever@linus.mongohq.com:10039/SocialLang';

Grid.mongo = mongoose.mongo;

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] == obj) {
            return true;
        }
    }
    return false;
}

var RoomPrefixes = {
    HeadToHead : "HTH",
    StudentTeacher : "ST",
    MemoryGame : "MG"
}


function getVariableFromSocket(socket, key, callback) {
    socket.get(key, function (err, key) {
        console.log(key);
        if(err){
             console.log(err);
             console.log("Error: could not get " + key + " from socket".error);
              callback(null);
        } else {
            callback(key);
        }
    });
}


exports.HandleClientImageCachingRequests = function (socket) {
    socket.on('MGImagesRequest', function (data) {
    	console.log('in MGImagesRequest'.green);
    	//calling from client room activity
    	getVariableFromSocket(socket, 'gameRoomID', function (gameRoomID) {
    		if(gameRoomID) {
    			MemoryGameModel.findByGameRoomID(gameRoomID, function (err, game) {
    				if(!err) console.log('game was found'.green);
    				if(typeof game.ImagesFilenames !== 'undefined' &&  game.ImagesFilenames > 0){
    					console.log('images array in game ISNT empty'.green);
    					randomizeAndSendToHost(socket, game);
    				} else{
    					console.log('images array in game IS empty'.green);
    					sendToGuestExistingImages(socket);
    				}
    			});
    		}
    	});
    });
}

function sendToGuestExistingImages(socket) {
	console.log('in sendToGuestExistingImages'.green);
}


function randomizeAndSendToHost(socket, game) {
	console.log('in randomizeAndSendToHost'.green);
	var conn = mongoose.createConnection(dburl);
	conn.once('open', function () {
	  var gfs = Grid(conn.db);
	  GetAllImageFileNamesInDatabase(gfs, function (filenames) {
			GetRandomImageFiles(gfs, filenames, function  (results) {
				var jsonResult = { result : "OK", images : results };
				saveImageToGameDocument(results, game);
				//socket.emit('MGImagesResponse', jsonResult);
			});
		});
	});
}

function saveImageToGameDocument(results, game) {
	for (var i = 0; i < results.length; i++) {
		game.ImagesFilenames.push(results[i].filename);
	};

	game.save(function (err) {
		if(!err) console.log('images were saved to game document!'.silly);
	})
}



function GetRandomImageFiles(gfs, filenames, callback) {
	var results = [];
	for (var i = 0; i < 8 ; i++) {
		var randDoc;
		do {
			randDoc = filenames[Math.floor(Math.random() * filenames.length)];
		} while(results.contains(randDoc));
		console.log('random file choosen is: ' + randDoc.filename);
		GetImageFromGridFS(gfs, randDoc.filename ,function  (filename, data) {
			results.push({ 'filename' : filename, 'data': data });
			if(results.length == 8) {
				callback(results);
			}
		});
	};
}

function GetImageFromGridFS(gfs, file, callback){
	console.log('trying to get : ' + file + ' from grid');
	// streaming from gridfs
	var readstream = gfs.createReadStream({
	  filename: file
	});

	 var buf = [];
    readstream.on('data', function (chunk){
        buf.push(chunk);
    });

    readstream.on('end', function() {
        console.log('File transfer completed! file : ' + file);
        var fb = Buffer.concat(buf);
        var base64data = fb.toString('base64');
        callback(file, base64data);
    });

	//error handling, e.g. file does not exist
	readstream.on('error', function (err) {
	  console.log('An error occurred streaming file from gridfs!', err);
	});
}



function GetAllImageFileNamesInDatabase(gfs, callback) {
    mongoose.connection.db.collection("fs.files", function (err, collection){
        collection.find({}, { 'filename' : 1 }).toArray(function (err, docs) {
        	if(err) {
        		console.log('error getting all filesnames from grid');
        		console.log(err);
        	} else{
            	console.log(docs);
        		callback(docs);		
        	}
        });
    });
}

function readFile (gfs, file) {
/*    console.log('file: '+ file  + ' not exists! writing this file to gridfs.');
    //put the files you want to store in the grid in data/images folder
    // streaming to gridfs
      var writestream = gfs.createWriteStream({
           filename: file, //this is the destination file name you want like dog.jpg
           //mode: 'w' // write in truncate mode. Existing data will be overwriten.
      });

      //fs.createReadStream(imagesLocalFolderPath + file).pipe(writestream);

      writestream.on('close', function (file) {
          console.log('finished uploading file : ' + file.filename);
      });*/
}