var mongoose = require('mongoose');
var User = mongoose.model('User');

exports.HandlePoints = function (socket) {
    socket.on('updatePointsRequest', function(data) {
    	console.log('in updatePointsRequest');
    	socket.get('id', function(err, id) {
    		if(id) {
    			User.UpdatePoints(id, data.points);
    		}
    	});
    });
}