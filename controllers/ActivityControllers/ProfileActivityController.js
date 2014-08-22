var mongoose = require('mongoose');
var User = mongoose.model('User');

exports.ProfileActivityHandler = function(socket) {
    socket.on('friendUserDetailsRequest', function (data) {
    	console.log("in friendUserDetailsRequest with data: " + data);
    	if(data.isFacebookUser) {
    		User.findOne({ "profileid" : data.friendprofileid }, function (err, user) {
    			if(err){
    				console.log("error getting user by profileid");
    				var jsonResponse = { result: "Failed" };
    				socket.emit('friendUserDetailsResponse', jsonResponse);
    			} else {
    				var jsonResponse = { result: "OK", friend : user };
    				socket.emit('friendUserDetailsResponse', jsonResponse);
    			}
    		});
    	} 
    	else {
			 User.findOne({ "username" : data.friendusername }, function (err, user) {
			 	if(err){
			 		console.log("error getting user by profileid");
			 		var jsonResponse = { result: "Failed" };
    				socket.emit('friendUserDetailsResponse', jsonResponse);
			 	} else {
    				var jsonResponse = { result: "OK", friend : user };
    				socket.emit('friendUserDetailsResponse', jsonResponse);
			 	}
			 });
    	}
    });
}

