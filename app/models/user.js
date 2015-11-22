// Grab the packages that we need for the user model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

// user schema
var UserSchema = new Schema({
	name: { type: String, required: true, index: { unique: true }},
	id: { type: String, required: true},
	password: { type: String, required: true, select: false },
	title: { type: String, required: true, select: true },
	dateJoined: { type: Date, required: true, select: true },
	admin: { type: Boolean, required: true, select: true },
	approved: { type: Boolean, required: true, select: true },
	inClan: { type: Boolean, required: true, select: true }
});

// hash the password before the user is saved
UserSchema.pre('save', function(next) {

	var user = this;
	// hash the password only if the password has been changed or user is new
	if (!user.isModified('password')) 
		return next();
	// generate the hash
	bcrypt.hash(user.password, null, null, function(err, hash) { 
		if (err) return next(err);
		// change the password to the hashed version
		user.password = hash;
		next();
	});
});

// method to compare a given password with the database hash
UserSchema.methods.comparePassword = function(password) { 
	var user = this;
	return bcrypt.compareSync(password, user.password);
};
// return the model
module.exports = mongoose.model('User', UserSchema);