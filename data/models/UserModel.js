var mongoose = require('mongoose');

var Levels = require('../../Levels.js').Levels;

// define the schema for our user model
var UserSchema = mongoose.Schema({
    isFacebookUser : Boolean,
    learningLanguage : String,
    motherLanguage :  String,
    firstName   : String,
    lastName    : String,
    username    : String,
    password    : String,
    profileid   : String,
    uniqueId    : Number,
    online      :  { type: Boolean, default: false },
    friends		: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    friendsRequests : [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    stats       : [{
        language: String,
        points: { type: Number, default: 0 },
        level: { type: String, enum: Levels }
     }],
    messages    : [{
        newMessage : { type: Boolean, default: true },
        subject : String,
        content : String,
        date : Date,
        messageId : Number,
        sender : { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }]
});

UserSchema.statics.UpdatePoints = function(userId, points) {
    this.findById(userId, function (err, user) {
        if(user) {
           for (var i = 0; i < user.stats.length; i++) {
               if(user.stats[i].language == user.learningLanguage) {
                    if(typeof points == 'string' || points instanceof String){
                        points = Number(points);
                    }
                    user.stats[i].points += points;
                    user.save(function (err) {
                        if(!err) {
                            console.log('updated user points and saved!');
                        }
                    });
                 break;
               }
            }
        }
    });
}

UserSchema.statics.GetFriends = function(userId, callback) {
    this.findById(userId)
        .populate('friends')
        .exec(callback);
}

UserSchema.statics.GetUserFull = function(userId, callback) {
    this.findById(userId)
        .populate('friends')
        .populate('messages.sender')
        .exec(callback);
}


UserSchema.statics.GetFriendsRequestsList = function(userId, callback) {
    this.findById(userId)
        .populate('friendsRequests')
        .exec(callback);
}

UserSchema.statics.GetMessages = function(userId, callback) {
    this.findById(userId)
        .populate('messages.sender')
        .exec(callback);
}

UserSchema.methods.SaveAsConnected = function (saveAsConnected) {
    var msgToConsole;
    if(saveAsConnected) {
         this.online = true;
         msgToConsole = 'user was as online user';
    } else {
         this.online = false;
         msgToConsole = 'user was as offline user';
    }

    this.save(function (errorSavingUser) {
        if(errorSavingUser) throw new Error(errorSavingUser);
        console.log(msgToConsole);
    });
}


UserSchema.statics.GetUserById = function (userId, callback) {
    User.findById(player1Id, function (error, user) {
        if (error) {
            console.log(err);
            callback(false, user);
        }
        else if(user) {
            callback(true, user);
        }
    });
}


mongoose.model('User', UserSchema);
