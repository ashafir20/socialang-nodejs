var mongoose = require('mongoose');
var UserModel = require('./models/UserModel');
var HeadToHeadQuizGameModel = require('./models/Games/HeadToHeadQuizGameModel');
var StudentTeacherGameModel = require('./models/Games/StudentTeacherGameModel');
var MemoryGameModel = require('./models/Games/MemoryGameModel');
var QuizGameModel = require('./models/Games/QuizGameModel');
var CountersModel = require('./models/CountersModel');
var DBPopulator = require('./DBPopulator');

var dburl = 'mongodb://social:inter4ever@linus.mongohq.com:10039/SocialLang';

mongoose.connection.on('connected', function () {
    console.log('Mongoose connected to ' + dburl);
});
mongoose.connection.on('error', function (err) {
    console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose disconnected');
});
process.on('SIGINT', function () {
    mongoose.connection.close(function () {
        console.log('Mongoose disconnected through app termination');
        process.exit(0);
    });
});
