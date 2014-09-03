var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var fs = require('fs');
var path = require('path');

var dburl = 'mongodb://social:inter4ever@linus.mongohq.com:10039/SocialLang';

var imagesLocalFolderPath = "Images/Upload/Animals/"
//var imagesLocalFolderPath = "Images/Upload/Food/"
//var imagesLocalFolderPath = "Images/Upload/Other/"
//var imagesLocalFolderPath = "Images/Upload/Human/"

Grid.mongo = mongoose.mongo;

var conn = mongoose.createConnection(dburl);
conn.once('open', function () {
  //uncomment this if you want to store new files in gridfs
  var gfs = Grid(conn.db);
  //UpdateGridFS(gfs);
});

function UpdateGridFS(gfs) {
  fs.readdir(imagesLocalFolderPath, function (err, files) {
    if(err) {
      console.log(err);
      throw new Error('error reading files from directory');
    }
    else {
        for (var i = 0; i < files.length; i++) {
          console.log(files[i]);
          writeFileIfNotExistsAlready(gfs, files[i]);
      }
    }
  });
}

function writeFileIfNotExistsAlready(gfs, file) {
  console.log('attempting to find file: ' + file);
    mongoose.connection.db.collection("fs.files", function (err, collection){
      checkIfFileInCollection(file, collection, function (exists) {
        if(!exists){
          putFile(gfs, file);
        }
      });
    });
}

function checkIfFileInCollection(file, collection, callback) {
      collection.find({ filename : file }).toArray(function (err, docs) {
         if(typeof docs !== 'undefined' && docs.length > 0) {
            console.log('file: '+ file + ' exists already in gridfs! not writing this file.');
            callback(true);
         } else {
            console.log('found : ' + docs.length + ' matching docs for this file!');
            console.log('its a new file! inserting it to the grid!');
            callback(false);
         }
      });
}

function putFile (gfs, file) {
    console.log('file: '+ file  + ' not exists! writing this file to gridfs.');
    //put the files you want to store in the grid in data/images folder
    // streaming to gridfs
      var writestream = gfs.createWriteStream({
           filename: file, //this is the destination file name you want like dog.jpg
           //mode: 'w' // write in truncate mode. Existing data will be overwriten.
      });

      fs.createReadStream(imagesLocalFolderPath + file).pipe(writestream);

      writestream.on('close', function (file) {
          console.log('finished uploading file : ' + file.filename);
      });
}