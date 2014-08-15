var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var fs = require('fs');
var path = require('path');

var dburl = 'mongodb://social:inter4ever@kahana.mongohq.com:10025/SociaLang-LocalStorage';

Grid.mongo = mongoose.mongo;

mongoose.connect(dburl);

var conn = mongoose.createConnection(dburl);
conn.once('open', function () {
  //uncomment this if you want to store new files in gridfs
  var gfs = Grid(conn.db);
  UpdateGridFS(gfs);

});

function UpdateGridFS(gfs) {
  fs.readdir('images/upload', function (err, files) {
    if(err) {
      console.log(err);
      throw new Error('error reading files from directory');
    }
    else {
        for (var i = 0; i < files.length; i++) {
          console.log(files[i]);
          putFile(gfs, files[i]);
      };
    }
  });
}

function putFile (gfs, file) {
    //put the files you want to store in the grid in data/images folder
    // streaming to gridfs
      var writestream = gfs.createWriteStream({
           filename: file, //this is the destination file name you want like dog.jpg
           mode: 'w' // write in truncate mode. Existing data will be overwriten.
      });

      fs.createReadStream("images/upload/" + file).pipe(writestream);

      writestream.on('close', function (file) {
          console.log('finished uploading file : ' + file.filename);
      });
}