var mongoose = require('mongoose');

// Create reference to a Schema
var blogSchema = new mongoose.Schema({
	title: String,
	body: String,
	created: {type: Date, default: Date.now},
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	}
});

// Complile the Schema above into a model
// We can export this compiled model to app.js
module.exports = mongoose.model("Blog", blogSchema);

