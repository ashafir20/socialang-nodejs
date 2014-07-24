var Grid = require('gridfs-stream');
var mongoose = require('mongoose');

var dburl = 'mongodb://social:inter4ever@linus.mongohq.com:10039/SocialLang';

exports.GetImageByName = function (fileName, callback) {
    var conn = mongoose.createConnection(dburl);
    conn.once('open', function () {
        var gfs = Grid(conn.db);
        // streaming from gridfs
        var readstream = gfs.createReadStream({
          filename: fileName
        });

        //error handling, e.g. file does not exist
        readstream.on('error', function (err) {
          console.log('An error occurred!', err);
          throw err;
        });

        readstream.on('end', function () {
          console.log('File transfer completed!');
        });

        callback(readstream);
    });
}