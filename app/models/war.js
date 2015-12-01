// Grab the packages that we need for the user model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// user schema
var WarSchema = new Schema({
	opponent:	{ type: String, required: true, select: true },		// The name of the opponent
	exp: 		{ type: Number, select: true},						// The Exp gained from the war
	ourScore: 	{ type: Number, select: true },						// The number of stars we got
	theirScore: { type: Number, select: true },						// The number of stars they got
	ourDest: 	{ type: Number, select: true },						// The percentage of total desctuction we got
	theirDest: 	{ type: Number, select: true },						// The percentage of total desctuction they got
	outcome:	{ type: String, select: true},						// The outcome: "win" or "loss"
	start: 		{ type: Date, required: true, select: true, index: { unique: true }},	// The date & time the war started
	size: 		{ type: Number, required: true, select: true },		// The number of people fighting on one side
	img: 		{ type: String, select: true },						// The img link to the war picture
	warriors:	{ type: [{	name: String,							// Array containing all the people who fought in the war
							attack1: String,						// Who they should hit the first time
							attack2: String,						// Who they should hit the second time
							lock1: Boolean,							// Admin can lock the attack1 choice
							lock2: Boolean,							// Admin can lock the attack2 choice
							stars1: Number,							// How many stars someone got on the first attack
							stars2: Number,							// How many stars someone got on the second attack
							viewed: Boolean }], required: true, select: true }	// Has the person viewed the war page since an update?
});

// return the model
module.exports = mongoose.model('War', WarSchema);