var mongoose = require('mongoose');

var CounterSchema = mongoose.Schema ({
	 name: String,
     counter: Number
});


mongoose.model('Counter', CounterSchema);