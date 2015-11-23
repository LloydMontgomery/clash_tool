var express	= require('express'),			// Express simplifies Node
	User 	= require('../models/user'),	// User Schema
	War 	= require('../models/war'),		// War Schema
	jwt 	= require('jsonwebtoken'),		// This is the package we will use for tokens
	aws 	= require('aws-sdk');			// This is for uploading to S3

// Need to try/catch the config setup
try {
	var config = require('../../config');
}

// Grab some config variables stored locally in the config or in the env if running on Heroku
var AWS_ACCESS_KEY 	= config.AWS_ACCESS_KEY_ID 		|| process.env.AWS_ACCESS_KEY_ID,
	AWS_SECRET_KEY 	= config.AWS_SECRET_ACCESS_KEY 	|| process.env.AWS_SECRET_ACCESS_KEY,
	S3_BUCKET_NAME 	= config.S3_BUCKET_NAME			|| process.env.S3_BUCKET_NAME,
	TOKEN_SECRET 	= config.TOKEN_SECRET 			|| process.env.TOKEN_SECRET,
	PORT			= config.PORT					|| process.env.PORT;

module.exports = function(app, express) {

	// Get an instance of the express router
	var apiRouter = express.Router();

	// ============================ PUBLIC APIS ============================ //

	// route to authenticate a user (POST http://localhost:8080/api/authenticate)
	apiRouter.post('/authenticate', function(req, res) {
		// find the user
		// select the name username and password explicitly 
		User.findOne({
			name: req.body.name
		}).select('name username password').exec(function(err, user) {
			if (err) throw err;
			    // no user with that username was found

			if (!user) {
				res.json({
					success: false,
					message: 'Authentication failed. User not found.'
				});
			} else if (user) {
				// check if password matches
				var validPassword = user.comparePassword(req.body.password);
				if (!validPassword) {
			  		res.json({
			    		success: false,
			    		message: 'Authentication failed. Wrong password.'
					});
				} else {
					// if user is found and password is right
					// create a token
					var token = jwt.sign({
						name: user.name,
			        	id: user._id
			        }, TOKEN_SECRET, 
			        { expiresIn: 7200 // expires in 2 hours 
					});
					// Save this for later
					req.decoded = jwt.decode(token);
			        // return the information including token as JSON
					res.json({
						success: true,
						message: 'Enjoy your token!', token: token
					});
				}
			}
		});
	});

	// USERS //
	apiRouter.route('/users')
	// create a user (accessed at POST http://localhost:8080/api/users)
	.post(function(req, res) {
		// create a new instance of the User model
		var user = new User();
		// set the users information (comes from the request)
		user.name = req.body.name;
		user.id = req.body.id;
		user.password = req.body.password;
		user.dateJoined = new Date();

		user.admin = false;  // Default to false
		if (req.body.admin)
			user.admin = req.body.admin;

		user.title = "Member";  // Default to "Member"
		if (req.body.title)
			user.title = req.body.title;

		if (req.headers.referer.indexOf("/users") > -1) {
			user.approved = true;
			user.inClan = true;
		} else {
			user.approved = false;
			user.inClan = false;
		}

		// save the user and check for errors
		user.save(function(err) { 
			if (err) {
				// duplicate entry
				if (err.code == 11000)
					return res.json({ success: false, message: 'A user with that name already exists.' }); 
				else
					return res.send(err);
			}
			res.json({ 
				success: true,
				message: 'User created!' });
		})
	})

	// get all the users (accessed at GET http://localhost:8080/api/users)
	.get(function(req, res) {
		User.find(function(err, users) {
			if (err) res.send(err);
			// return the users
			res.json(users);
		});
	});

	apiRouter.route('/wars')
	// get all the wars (accessed at GET http://localhost:8080/api/wars)
	.get(function(req, res) {
		War.find(function(err, wars) {
			if (err) res.send(err);
			// return the wars
			res.json(wars);
		});
	});


	// ======================== BASIC AUTHENTICATION ======================== //

	// route middleware to verify a token
	apiRouter.use(function(req, res, next) {
		// check header or url parameters or post parameters for token
		var token = req.body.token || req.query.token || req.headers['x-access-token']; 

		// decode token
		if (token) {
			// verifies secret and checks exp
			jwt.verify(token, TOKEN_SECRET, function(err, decoded) { 
				if (err) {
					return res.status(403).send({ 
						success: false,
						message: 'Failed to authenticate token.'
					});
				} else {
					// if everything is good, save to request for use in other routes 
					req.decoded = decoded;
					next();
				}
			});
		} else {
			// If there is no token
			// Return an HTTP response of 403 (access forbidden) and an error message 
			return res.status(403).send({
				success: false,
				message: 'No token provided.'
			});
		}
		// next() used to be here
	});

	// ============================ PRIVATE APIS ============================ //

	// API endpoint to get user information
	apiRouter.get('/me', function(req, res) {
		res.send(req.decoded);
	});

	// ======================== ADMIN AUTHENTICATION ======================== //

	// route middleware to verify the token is owned by an admin
	apiRouter.use(function(req, res, next) {
		// use our user model to find the user we want
		User.findById(req.decoded.id, function(err, user) { 

			if (user.admin == true) {
				next();
			} else {
				return res.status(403).send({
					success: false,
					message: 'Failed to authenticate token.'
				});
			}
		});
	});

	// ============================= ADMIN APIS ============================= //

	// AMAZON S3 ROUTE // 
	apiRouter.route('/sign_s3')
	// (accessed at GET http://localhost:8080/api/sign_s3) 
	.get(function(req, res){
		aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
		var s3 = new aws.S3();
		var s3_params = {
			Bucket: S3_BUCKET_NAME,
			Key: req.query.file_name,
			Expires: 60,
			ContentType: req.query.file_type,
			ACL: 'public-read'
		};
		s3.getSignedUrl('putObject', s3_params, function(err, data){
			if(err){
				console.log(err);
			} else{
				var return_data = {
					signed_request: data,
					url: 'https://'+S3_BUCKET+'.s3.amazonaws.com/'+req.query.file_name
				};
				res.write(JSON.stringify(return_data));
				res.end();
			}
		});
	});

	// SPECIFIC USERS //
	apiRouter.route('/users/:user_id')
	// (accessed at GET http://localhost:8080/api/users/:user_id) 
	.get(function(req, res) {
		User.findById(req.params.user_id, function(err, user) { 
			if (err) res.send(err);
			// return that user
			res.json(user);
		});
	})

	// update the user with this id
	// (accessed at PUT http://localhost:8080/api/users/:user_id) 
	.put(function(req, res) {
		// use our user model to find the user we want
		User.findById(req.params.user_id, function(err, user) { 
			if (err) res.send(err);
			// update the users info only if its new
			if (req.body.name) 
				user.name = req.body.name;
			if (req.body.username) 
				user.id = req.body.id;
			if (req.body.password)
				user.password = req.body.password;
			if (req.body.title)
				user.title = req.body.title;
			if (req.body.approved != null)
				user.approved = req.body.approved;
			if (req.body.inClan != null)
				user.inClan = req.body.inClan;
			if (req.body.admin != null)
				user.admin = req.body.admin;

			// save the user
			user.save(function(err) {
				if (err) res.send(err);
				// return a message
				res.json({
					success: true,
					message: 'User updated!'
				});
			});
		});
	})

	// Delete the user with this id
	// (accessed at DELETE http://localhost:8080/api/users/:user_id)
	.delete(function(req, res) {
		User.remove({
			_id: req.params.user_id
		}, function(err, user) {
			if (err) return res.send(err);
			res.json({ message: 'Successfully deleted' });
		});
	});

	apiRouter.route('/wars')
	// create a war (accessed at POST http://localhost:8080/api/wars)
	.post(function(req, res) {
		// create a new instance of the User model
		var war = new War();
		// set the users information (comes from the request)
		war.number = req.body.number;
		war.exp = req.body.exp;
		war.ourScore = req.body.ourScore;
		war.theirScore = req.body.theirScore;
		war.date = req.body.date;

		// save the war and check for errors
		war.save(function(err) { 
			if (err) {
				// duplicate entry
				if (err.code == 11000)
					return res.json({ success: false, message: 'A war with that number already exists.' }); 
				else
					return res.send(err);
			}
			res.json({ 
				success: true,
				message: 'War created!' });
		})
	})


	// SPECIFIC WARS //
	apiRouter.route('/wars/:war_id')
	// (accessed at GET http://localhost:8080/api/wars/:war_id) 
	.get(function(req, res) {
		War.findById(req.params.war_id, function(err, war) { 
			if (err) res.send(err);
			// return that user

			res.json(war);
		});
	})

	// update the war with this id
	// (accessed at PUT http://localhost:8080/api/wars/:war_id) 
	.put(function(req, res) {
		// use our war model to find the war we want
		War.findById(req.params.war_id, function(err, war) { 
			if (err) res.send(err);
			// update the wars info only if its new
			if (req.body.number) 
				war.number = req.body.number;
			if (req.body.exp) 
				war.exp = req.body.exp;
			if (req.body.ourScore)
				war.ourScore = req.body.ourScore;
			if (req.body.theirScore)
				war.theirScore = req.body.theirScore;
			if (req.body.date)
				war.date = req.body.date;
			if (req.body.img)
				war.img = req.body.img;
			// save the war
			war.save(function(err) {
				if (err) res.send(err);
				// return a message
				res.json({ message: 'War updated!' });
			});
		});
	});


	return apiRouter;

};




