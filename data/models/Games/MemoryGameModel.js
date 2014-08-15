var mongoose = require('mongoose');

var GameStates = ['Waiting' ,'Ready' ,'Playing'];

var MemoryGameSchema = mongoose.Schema ({
    Player1 : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    Player2 : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    CurrentPlayerTurn :  { type: Number, default: 1 },
    GameState : {type : String, enum : GameStates },
    GameRoomID : { type: Number, unique: true },
    Player1Score : { type: Number, default: 0 },
    Player2Score : { type: Number, default: 0 },
    LastPlay : { type : Date },
    TimeCreated : { type : Date, default: new Date() }
});


MemoryGameSchema.statics.findByGameRoomID = function(gameNumber, callback) {
    this.findOne({'GameRoomID' : gameNumber})
        .populate('Player1 Player2')
        .exec(callback);
}

MemoryGameSchema.statics.GetByGameState = function(gameState, callback) {
    this.find({'GameState' : gameState})
        .populate('Player1')
        .exec(callback);
}


mongoose.model('MemoryGame', MemoryGameSchema);

