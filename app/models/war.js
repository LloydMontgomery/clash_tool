// Grab the packages that we need for the user model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// user schema
var WarSchema = new Schema({
	number: { type: Number, required: true, index: { unique: true }},
	exp: { type: Number, required: true},
	ourScore: { type: Number, required: true, select: true },
	theirScore: { type: Number, required: true, select: true },
	date: { type: Date, required: true, select: true },
	img: { type: String, select: true}
});

// return the model
module.exports = mongoose.model('War', WarSchema);