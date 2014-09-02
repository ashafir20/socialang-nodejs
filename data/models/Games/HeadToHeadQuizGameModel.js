var mongoose = require('mongoose');
var dict = require('../../../controllers/Dictionary/DictionaryController');

var GameStates = ['Waiting' ,'Ready' ,'Playing'];
var PlayerNumber = [1 ,2];

var HeadToHeadQuizGameSchema = mongoose.Schema ({
    Player1 : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    Player2 : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    Player1NumOfHearts : { type: Number, default: 5 },
    Player2NumOfHearts :  { type: Number, default: 5 },
    CurrentPlayerTurn :  { type: Number, default: 1 },
    GameState : {type : String, enum : GameStates },
    GameRoomID : { type: Number, unique: true },
    RematchDetails : { 
        PlayerInviting : mongoose.Schema.Types.ObjectId,
        InviteState : { type: String, default: "NoInvite" },
    },
    dateCreated : String, //moment date
    LastRound : { 
        Q : String,
        A : [String],
        Answer : String
    }
});

HeadToHeadQuizGameSchema.statics.GetRound = function(callback) {
     dict.getQuizGameQuestionAndAnswers(callback);
}

HeadToHeadQuizGameSchema.statics.findByGameRoomID = function(gameNumber, callback) {
    this.findOne({'GameRoomID' : gameNumber})
        .populate('Player1 Player2')
        .exec(callback);
}

HeadToHeadQuizGameSchema.statics.GetByGameState = function(gameState, callback) {
    this.find({'GameState' : gameState})
        .populate('Player1')
        .exec(callback);
}

HeadToHeadQuizGameSchema.statics.ShuffleWords = function(words) {
    return dict.shuffle(words);
}



mongoose.model('HeadToHead', HeadToHeadQuizGameSchema);