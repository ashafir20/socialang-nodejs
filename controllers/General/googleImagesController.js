/**
 * Created by avi on 6/20/14.
 */
var Grid = require('gridfs-stream');
var giSearch = require('google-image-search');
var fileController = require('FilesController');

exports.ImagesHandler = function(socket) {
    socket.on('getImage' , function(data) {
        giSearch(data.SearchName).pipe(fs.createWriteStream(data.SearchName+ '.jpg'),function() {
            fileController.saveFile({fileName : data.SearchName+ '.jpg'} , function () {
                var jsonResponse;
                var gfs = Grid(mongoose.connection.db);
                gfs.exist({
                        filename: data.SearchName +'.jpg'
                    },
                    function (err,found) {
                        if (err)  {
                            jsonResponse = { result : "Failed" };
                            socket.emit("getFileResponse", jsonResponse);
                        }
                        else if (found) {
                            // streaming from gridfs
                            var readstream = gfs.createReadStream({
                                filename: data.fileName
                            });

                            readstream.pipe(jsonResponse.fileData);

                            jsonResponse.result = 'OK';

                            socket.emit("getFileResponse", jsonResponse);
                        }});
            })
        });
    })
}
