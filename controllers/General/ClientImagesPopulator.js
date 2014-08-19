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
                    if(err) throw new Error('game was not found!');
    				else if(!err) console.log('game was found'.green);
    				if(data.isHost == 'true') {
    					console.log('user is host'.green);
    					GetRandomizedImages(game, function (results) {
                            SaveImagesToGameDocument(results, game);
                            var jsonResult = { result : "OK", images : results };
                            socket.emit('MGImagesResponse', jsonResult);
                            //clear images from document
                        });
    				} else {
    					console.log('user is guest'.green);
    					GetExistingImages(game, function (results) {
                            if(results != null){
                                var jsonResult = { result : "OK", images : results };
                                socket.emit('MGImagesResponse', jsonResult);
                            } else {
                                var jsonResult = { result : "Failed", "Message" : 'TryAgain' };
                                socket.emit('MGImagesResponse', jsonResult);
                            }
                        });
    				}
    			});
    		}
    	});
    });
}

function GetExistingImages(game, callback) {
	console.log('in sendToGuestExistingImages'.green);
    var conn = mongoose.createConnection(dburl);
    conn.once('open', function () {
        var gfs = Grid(conn.db);
        //stream from gridfs the game.ImagesFilenames
        var results = [];
        if(typeof game.ImagesFilenames !== 'undefined' && game.ImagesFilenames.length > 0)
        {
            console.log('in GetExistingImages and images are in document'.green);
            console.log('images array doc length: ' + game.ImagesFilenames.length);
            for (var i = 0; i < game.ImagesFilenames.length ; i++) 
            {
                console.log('getting file : ' + game.ImagesFilenames[i].filename);
                var filename = game.ImagesFilenames[i].filename;
                var pairid = game.ImagesFilenames[i].pairId;
                GetImageFromGridFS(gfs, filename, pairid ,function  (filename, pairid, data) {
                    results.push({ 'filename' : filename, 'pairId' : pairid, 'data': data }); 
                    if(results.length == game.ImagesFilenames.length) {
                        callback(results);
                    }
                }); 
            }
        }  
        else 
        {
            console.log('in GetExistingImages and no images in document'.error);
            callback(null);
        }
    });
}



function GetRandomizedImages(game, callback) {
	console.log('in randomizeAndSendToHost'.green);
	var conn = mongoose.createConnection(dburl);
	conn.once('open', function () {
	  var gfs = Grid(conn.db);
	  GetAllImageFileNamesInDatabase(gfs, function (filenames) {
			GetRandomImageFiles(gfs, filenames, function  (results) {
                callback(results);
			});
		});
	});
}

function SaveImagesToGameDocument(results, game) {
    console.log('in SaveImagesToGameDocument'.silly);
	for (var i = 0; i < results.length; i++) {
        console.log('pushed ' + results[i].filename + " to document images array".green);
		game.ImagesFilenames.push({ 'filename' : results[i].filename, 'pairId' : results[i].pairId });
	};

	game.save(function (err, game) {
		if(!err) {
            console.log('images were saved to game document!'.silly);
            console.log(game);
        }
        else {
            console.log('game could not be saved after inserting images'.error);
        }
	})
}



function GetRandomImageFiles(gfs, filenames, callback) {
	var results = [];
    var alreadyTakenFilenames = [];
	for (var pairid = 1; pairid <= 8 ; pairid++) 
    {
        var randDoc = getRandomImageFromArray(filenames, alreadyTakenFilenames);
		console.log('random file choosen is: ' + randDoc.filename);
		GetImageFromGridFS(gfs, randDoc.filename, pairid ,function  (filename, pairId, data) {
			results.push({ 'filename' : filename, 'data': data , 'pairId' : pairId });
			if(results.length == 8) {
				callback(results);
			}
		});
	}
}

function getRandomImageFromArray(allGridfsFilesnames, alreadyTakenFilenames) {
    var randDoc;
    do {
        randDoc = allGridfsFilesnames[Math.floor(Math.random() * allGridfsFilesnames.length)];
    } while(alreadyTakenFilenames.contains(randDoc.filename));

    alreadyTakenFilenames.push(randDoc.filename);
    return randDoc;
}

function GetImageFromGridFS(gfs, file, pairid, callback){
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
        callback(file, pairid ,base64data);
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