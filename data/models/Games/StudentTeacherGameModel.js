var mongoose = require('mongoose');

var GameStates = ['Waiting' ,'Ready' ,'Playing'];
var GameType = ['TeacherGame', 'StudentGame'];

var StudentTeacherGameSchema = mongoose.Schema ({
    Student : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    Teacher : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    CurrentPlayerTurn :  { type: Number, default: 1 },
    GameState : {type : String, enum : GameStates },
    GameType : {type : String, enum : GameType },
    GameRoomID : { type: Number, unique: true },
});


StudentTeacherGameSchema.statics.GetStudentsGamesByGameState = function(gameState, callback) {
    this.find({'GameState' : gameState, 'GameType' : 'StudentGame'})
        .populate('Student')
        .exec(callback);
}

StudentTeacherGameSchema.statics.findByGameRoomID = function(gameNumber, callback) {
    this.findOne({'GameRoomID' : gameNumber})
        .populate('Student Teacher')
        .exec(callback);
}

StudentTeacherGameSchema.statics.GetTeachersGamesByGameState = function(gameState, callback) {
    this.find({'GameState' : gameState, 'GameType' : 'TeacherGame'})
        .populate('Teacher')
        .exec(callback);
}

mongoose.model('StudentTeacher', StudentTeacherGameSchema);