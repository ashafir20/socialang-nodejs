var mongoose = require('mongoose');
var Grid = require('gridfs-stream');

var dburl = 'mongodb://social:inter4ever@linus.mongohq.com:10039/SocialLang';

Grid.mongo = mongoose.mongo;
var conn = mongoose.createConnection(dburl);

exports..HandleClientImageCachingRequests = function (socket) {
    socket.on('ICImagesRequest', function (data) {
    	console.log(data);
    	conn.once('open', function () {
		  var gfs = Grid(conn.db);
		  GetAllImageFileNamesInDatabase(gfs, function (filenames) {

		  });
		});
    });
}

function GetAllImageFileNamesInDatabase(gfs) {
    mongoose.connection.db.collection("fs.files", function (err, collection){
        collection.find({ 'filename' : file }, { 'filename' }).toArray(function (err, docs) {
        	console.log(docs);
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