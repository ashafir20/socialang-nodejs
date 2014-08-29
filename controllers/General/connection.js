var mongoose = require('mongoose');
var User = mongoose.model("User");


exports.disconnectHandler = function(socket) {

    socket.on('disconnect', function () {
        console.log('user disconnected...');
        socket.get('id', function (err, userId) {
        	if(userId) {
        		User.findById(userId, function (error, user){
        			user.SaveAsConnected(false);
        		});
        	}
        });
    });
    
}
