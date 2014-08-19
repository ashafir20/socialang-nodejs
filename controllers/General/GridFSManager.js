var Grid = require('gridfs-stream');
var mongoose = require('mongoose');
var giSearch = require('google-image-search');
var client = require('google-images');
var fs = require('fs');
var zlib = require('zlib');
//var sleep = require('sleep');

var dbGoogleImagesDatabaseUrl = 'mongodb://social:inter4ever@kahana.mongohq.com:10075/SociaLang-GoogleImagesDatabase'

exports.GetImageByName = function (socket) {
        socket.on('getImage', function (filename) {
        var gfs;
        var conn = mongoose.createConnection(dbGoogleImagesDatabaseUrl);
        conn.once('open', function () {
            gfs = Grid(conn.db);
            dc.TranslateWord(filename.fileName,socket,function (err,translatedWord) {
                client.search('picture of ' + filename.fileName + '.jpeg',function (err,images) {
                    if (err) {
                        console.log('ERRORR GOOGLE', err);
                    }
                    else {
                        console.log(images.length);
                        var myImage = images[0];
                        for (var i =0; i<images.length; i++) {

                            if ((parseInt(myImage.height) > parseInt(images[i].height)) && (parseInt(myImage.width) > parseInt(images[i].width))) {
                                myImage = images[i];
                            }
                        }
                        console.log(myImage.width + " " + myImage.height);
                        myImage.writeTo('tempPic.jpg', function () {
                            //save on database
                            var writestream = gfs.createWriteStream({filename : filename.fileName + '.jpg'});
                            var readfsStream = fs.createReadStream('tempPic.jpg');
                            readfsStream.pipe(writestream);

                            var buf = []

                            readfsStream.on('data', function(chunk){
                                buf.push(chunk);
                            });

                            readfsStream.on('error', function (err) {
                                console.log(err)
                            });

                            readfsStream.on('end',function() {

                                console.log('File transfer completed!');
                                var fb = Buffer.concat(buf);

                                var base = (fb.toString('base64'));
                                if(base.length > 450000) {
                                    var jsonResponse2 = {data : 'null', from : 'database', title : translatedWord};
                                }
                                else{
                                    var jsonResponse2 = {data : base, from : 'database', title : translatedWord};
                                }
                                socket.emit("userFileRequest",jsonResponse2);


                            });
                        });
                    }
                });
            });
        });
        
    });

    socket.on('getRandomImage', function () {
        var gfs;
        var conn = mongoose.createConnection(dbGoogleImagesDatabaseUrl);
        conn.once('open', function () {
            gfs = Grid(conn.db);
            var newWord = dc.getRandomPictureWord(function (word) {
            dc.TranslateWord(word,socket,function (err,translatedWord) {
                client.search(word + '.jpeg', function (err,images) {
                    if (err) {
                        console.log('ERRORR GOOGLE', err);
                    }
                    else {
                        console.log(images.length);
                        var myImage = images[0];
                        // for (var i =0; i<images.length; i++) {

                        //     if ((parseInt(myImage.height) > parseInt(images[i].height)) && (parseInt(myImage.width) > parseInt(images[i].width))) {
                        //         myImage = images[i];
                        //     }
                        // }
                        console.log(myImage.width + " " + myImage.height);
                        myImage.writeTo('tempPic.jpg', function () {
                            //save on database
                            var writestream = gfs.createWriteStream({filename : word + '.jpg'});
                            var readfsStream = fs.createReadStream('tempPic.jpg');
                            readfsStream.pipe(writestream);

                            var buf = []

                            readfsStream.on('data', function(chunk){
                                buf.push(chunk);
                            });

                            readfsStream.on('error', function (err) {
                                console.log(err)
                            });

                            readfsStream.on('end',function() {

                                console.log('File transfer completed!');
                                var fb = Buffer.concat(buf);

                                var base = (fb.toString('base64'));
                                if(base.length > 450000) {
                                    var jsonResponse2 = {data : 'null', from : 'database', title : translatedWord};
                                }
                                else{
                                    var jsonResponse2 = {data : base, from : 'database', title : translatedWord};
                                }
                                socket.emit("fileRequest",jsonResponse2);


                            });
                        });
                    }
                });
            });
        });
        });
        
    });
}












  
