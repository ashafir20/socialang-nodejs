var mongoose = require('mongoose');
var giSearch = require('google-image-search');
var client = require('google-images');
var dc = require("../Dictionary/DictionaryController");

exports.GetImageByName = function (socket) {

    socket.on('getImage', function (filename) {
        dc.TranslateWord(filename.fileName,socket,function (err,translatedWord) {
            FindImage(translatedWord, filename.fileName, socket, "userFileRequest");
            }); 
    });

    socket.on('getRandomImage', function () {
            var newWord = dc.getRandomPictureWord(function (word) {
            dc.TranslateWord(word,socket,function (err,translatedWord) {
                FindImage(translatedWord, word, socket, "getRandomImage");
            });
        });   
    });
}

function FindImage(translatedWord, word, socket, type) {
    client.search(word, function (err,images) {
        if (err) {
                console.log('ERRORR GOOGLE', err);
                var jsonResponse2 = {result : 'null', title : translatedWord, url : 'null'};
                FindImage(translatedWord, word, socket, type);
                return;
            }
            else {
                console.log(images.length);
                var myImage = images[0];
                console.log(myImage.width + " " + myImage.height);
                console.log('File transfer completed!');
                var jsonResponse2 = {result : 'OK', title : translatedWord, url : myImage.unescapedUrl};  //OR: myImage.unescapedUrl
                if(type == "getRandomImage") {
                    socket.emit("fileRequest",jsonResponse2);
                }
                else {
                    socket.emit("userFileRequest",jsonResponse2);
                }
            }
        });         
}







