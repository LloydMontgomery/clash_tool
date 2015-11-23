// Grab the packages that we need for the user model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// user schema
var WarSchema = new Schema({
	exp: { type: Number, required: true},
	ourScore: { type: Number, required: true, select: true },
	theirScore: { type: Number, required: true, select: true },
	ourDest: { type: Number, required: true, select: true },
	theirDest: { type: Number, required: true, select: true },
	date: { type: Date, required: true, select: true, index: { unique: true }},
	img: { type: String, required: true, select: true},
});

// return the model
module.exports = mongoose.model('War', WarSchema);