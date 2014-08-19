var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var fs = require('fs');
var path = require('path');

var dburl = 'mongodb://social:inter4ever@linus.mongohq.com:10039/SocialLang';
var imagesLocalFolderPath = "Images/Upload/Animals/"

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
    mongoose.connection.db.collection("fs.files", function (err, collection){
        collection.find({ filename : file }).toArray(function (err, docs){
           if(docs == null) {
              putFile(gfs, file);
           } else {
             console.log('file: '+ file + ' exists already in gridfs! not writing this file.');
           }
        });
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

      //fs.createReadStream(imagesLocalFolderPath + file).pipe(writestream);

      writestream.on('close', function (file) {
          console.log('finished uploading file : ' + file.filename);
      });
}