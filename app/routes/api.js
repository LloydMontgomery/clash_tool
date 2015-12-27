var express	= require('express'),			// Express simplifies Node
	User 	= require('../models/user'),	// User Schema
	War 	= require('../models/war'),		// War Schema
	jwt 	= require('jsonwebtoken'),		// This is the package we will use for tokens
	aws 	= require('aws-sdk'),			// This is for uploading to S3
	bcrypt	= require('bcrypt-nodejs'),
	http 	= require('http');

// Need to try/catch the config setup
var config = {}; // This is to prevent errors later
try {
	config = require('../../config');
} catch (e) {
	console.log("Running on Heroku, use Config Vars");
}

// Grab some config variables stored locally in the config or in the env if running on Heroku
var AWS_ACCESS_KEY 	= config.AWS_ACCESS_KEY_ID 		|| process.env.AWS_ACCESS_KEY_ID,
	AWS_SECRET_KEY 	= config.AWS_SECRET_ACCESS_KEY 	|| process.env.AWS_SECRET_ACCESS_KEY,
	S3_BUCKET_NAME 	= config.S3_BUCKET_NAME			|| process.env.S3_BUCKET_NAME,
	TOKEN_SECRET 	= config.TOKEN_SECRET 			|| process.env.TOKEN_SECRET,
	PORT			= config.PORT					|| process.env.PORT;

var AWS = require("aws-sdk");

// Need to try/catch the config setup
var config = {}; // This is to prevent errors later
try {
	config = require('../../config');
} catch (e) {
	console.log("Running on Heroku, use Config Vars");
}

AWS.config.update({
	"accessKeyId": AWS_ACCESS_KEY,
	"secretAccessKey": AWS_SECRET_KEY,
	"region": "us-west-2"
});

var dynamodb = new AWS.DynamoDB();

var dynamodbDoc = new AWS.DynamoDB.DocumentClient();

var convertData = function(data) {
	if (Array.isArray(data)) {
		for (i in data)
			data[i] = convertData(data[i]);
	} else {  // An object
		for (item in data) {
			type = Object.keys(data[item])[0];
			if (type == 'M')
				data[item] = convertData(data[item][type]);
			else
				data[item] = data[item][type];
		}
	}
	return data;
};

module.exports = function(app, express, $http) {

	// Get an instance of the express router
	var apiRouter = express.Router();

	apiRouter.use(function(req, res, next) {
		console.log('Request to API: ' + req.path);
		next();
	});

	// ============================ PUBLIC APIS ============================ //

	// route to authenticate a user (POST http://localhost:8080/api/authenticate)
	apiRouter.post('/authenticate', function(req, res) {
		// find the user
		// select the name username and password explicitly 

		dynamodb.query({
			TableName : "Users",
			ProjectionExpression: "#n, password, id, inClan, admin",
			KeyConditionExpression: "#n = :nameVal",
			ExpressionAttributeNames: {
				"#n": "name"
			},
			ExpressionAttributeValues: {
				":nameVal": {'S': req.body.name}
			},
			Limit : 1000
		}, function(err, data) {
			if (err) {
				return res.json({
					success: false,
					message: 'Database Error. Try again later.',
					data: data
				});
			}

			if (data.Count == 0) {  // Then the username must have been incorrect
				return res.json({
					success: false,
					message: 'Authentication failed.'
				});
			} else {

				if (!data.Items[0].inClan.BOOL) {
					return res.json({
						success: false,
						message: 'Waiting on Admin to Approve'
					});
				}

				// check if password matches
				var validPassword = bcrypt.compareSync(req.body.password, data.Items[0].password.S);

				if (!validPassword) {
					res.json({
						success: false,
						message: 'Authentication failed.'
					});
				} else {
					data = convertData(data.Items[0]);

					// if user is found and password is right
					// create a token
					var token = jwt.sign({
						name: data.name,
						inClan: data.inClan,
						admin: data.admin
					}, TOKEN_SECRET,
					{ expiresIn: 172800 // expires in 2 days 
					// { expiresIn: 720 // expires in 2 hours 
					// { expiresIn: 10 // expires in 10 seconds (This is for debugging)
					});
					// Save this for later
					req.decoded = jwt.decode(token);

					// return the information including token as JSON
					res.json({
						success: true,
						message: 'Enjoy your token!', 
						token: token
					});
				}
			}
		});
	});

	// USERS //
	apiRouter.route('/users')
	// create a user (accessed at POST http://localhost:8080/api/users)
	.post(function(req, res) {

		var user = {
			TableName: 'Users',
			Item: {},
			Expected: {
				"name" : { "Exists" : false},
			}
		};

		// set the users information (comes from the request)
		user.Item.name = req.body.name;
		user.Item.id = req.body.id;
		now = new Date();
		user.Item.dateJoined = now.getTime();

		user.Item.password = bcrypt.hashSync(req.body.password);

		user.Item.admin = false;  // Default to false
		user.Item.inClan = false; // Default to false
		// If the request comes from the "Create User" page, then we can set these
		if (req.headers.referer.indexOf("/users") > -1) {
			user.Item.admin = req.body.admin;
			user.Item.inClan = req.body.inClan;
		}

		user.Item.title = "Member";  // Default to "Member"
		if (req.body.title)
			user.Item.title = req.body.title;

		dynamodbDoc.put(user, function(err, data) {
			if (err) {
				console.error("Unable to add user. Error JSON:", JSON.stringify(err, null, 2));
				return res.json({ 
					success: false, 
					message: err.message
				}); 
			} else {
				res.json({ 
					success: true,
					message: 'User created!' 
				});
			}
		});
	});

	apiRouter.route('/partialUsers')
	// get all the users (accessed at GET http://localhost:8080/api/users)
	.get(function(req, res) {

		dynamodb.scan({
			TableName : "Users",
			ProjectionExpression: "#n, title, dateJoined, inClan",
			FilterExpression: "inClan = :jut",
			ExpressionAttributeNames: {
				"#n": "name"
			},
			ExpressionAttributeValues: {
				":jut": {'BOOL': true},
			},
			Limit : 1000
		}, function(err, data) {
			if (err) { 
				return res.json({
					success: false,
					message: 'Database Error. Try again later.',
					data: data.Items
				});
			}

			if (data.Count == 0) {  // Then the query came back empty
				return res.json({
					success: false,
					message: 'Query Failed.'
				});
			} else {
				data = convertData(data.Items);

				res.json({
					success: true,
					message: 'Successfully returned all Users',
					data: data
				});
			}
		});
	});

	apiRouter.route('/partialWars')
	// get all the users (accessed at GET http://localhost:8080/api/users)
	.get(function(req, res) {

		dynamodb.scan({
			TableName : "Wars",
			ProjectionExpression: "createdAt, #1, outcome, ourScore, theirScore, exp, img",
			ExpressionAttributeNames: {
				"#1": "start"
			},
			Limit : 1000
		}, function(err, data) {
			if (err) { 
				return res.json({
					success: false,
					message: 'Database Error. Try again later',
				});
			} else {
				data = convertData(data.Items);

				res.json({
					success: true,
					message: 'Successfully returned all Wars',
					data: data
				});
			}
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
						error: err,
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
				error: { name: 'NoTokenProvidedError' },
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

	apiRouter.route('/wars')
	// get all the wars (accessed at GET http://localhost:8080/api/wars)
	.get(function(req, res) {
		dynamodb.scan({
			TableName : "Wars",
			Limit : 1000
		}, function(err, data) {
			if (err) { 
				return res.json({
					success: false,
					message: 'Database Error. Try again later.'
				});
			}
			res.json({
				success: true,
				message: 'Successfully returned all Wars',
				data: data.Items
			});
		});
	});

	apiRouter.route('/wars/:war_id')
	// (accessed at GET http://localhost:8080/api/wars/:war_id) 
	.get(function(req, res) {
		dynamodb.query({
			TableName : 'Wars',
			KeyConditionExpression: '#1 = :createdAt',
			ExpressionAttributeNames: {
				'#1': 'createdAt'
			},
			ExpressionAttributeValues: {
				':createdAt': { 'S': req.params.war_id }
			},
			Limit : 1000
		}, function(err, data) {
			if (err) { 
				console.log(err.message);
				return res.json({
					success: false,
					message: 'Database Error. Try again later.',
					data: err
				});
			}

			if (data.Count == 0) {  // Then the username must have been incorrect
				return res.json({
					success: false,
					message: 'Query Failed. War not found.'
				});
			} else {
				// console.log(data.Items[0]);
				// Convert all the values to non-object values
				data = convertData(data.Items[0])

				// console.log(data);

				// Collect all the warriors into a single array
				data.warriors = [];
				for (var i = 0; data[i] != null; i++) {
					data.warriors.push(data[i]);
					delete data[i];
				};

				res.json({
					success: true,
					message: 'Successfully returned all Wars',
					data: data
				});
			}
		});
	})

	// update the war with this id
	// (accessed at PUT http://localhost:8080/api/wars/:war_id) 
	.put(function(req, res) {

		// Initialize and assign attributes to be written to DynamoDB
		updateExp = 'set';
		expAttNames = {};
		expAttVals = {};

		// Only update the values the server is passed, 
		// and don't try to update things that do not exist
		if (req.body.opponent) {
			updateExp += ' #name1 = :val1,';
			expAttNames['#name1'] = 'opponent';
			expAttVals[':val1'] = req.body.opponent;
		} if (req.body.size) {
			updateExp += ' #name2 = :val2,';
			expAttNames['#name2'] = 'size';
			expAttVals[':val2'] = req.body.size;
		} if (req.body.start) {
			updateExp += ' #name3 = :val3,';
			expAttNames['#name3'] = 'start';
			expAttVals[':val3'] = req.body.start;
		} if (req.body.exp) {
			updateExp += ' #name4 = :val4,';
			expAttNames['#name4'] = 'exp';
			expAttVals[':val4'] = req.body.exp;
		} if (req.body.ourDest) {
			updateExp += ' #name5 = :val5,';
			expAttNames['#name5'] = 'ourDest';
			expAttVals[':val5'] = req.body.ourDest;
		} if (req.body.theirDest) {
			updateExp += ' #name6 = :val6,';
			expAttNames['#name6'] = 'theirDest';
			expAttVals[':val6'] = req.body.theirDest;
		} if (req.body.ourScore) {
			updateExp += ' #name7 = :val7,';
			expAttNames['#name7'] = 'ourScore';
			expAttVals[':val7'] = req.body.ourScore;
		} if (req.body.theirScore) {
			updateExp += ' #name8 = :val8,';
			expAttNames['#name8'] = 'theirScore';
			expAttVals[':val8'] = req.body.theirScore;
		} if (req.body.outcome) {
			updateExp += ' #name9 = :val9,';
			expAttNames['#name9'] = 'outcome';
			expAttVals[':val9'] = req.body.outcome;
		} if (req.body.img) {
			updateExp += ' #name10 = :val10,';
			expAttNames['#name10'] = 'img';
			expAttVals[':val10'] = req.body.img;
		}

		// Warriors are added separately, each as their own entry //
		for (warrior in req.body.warriors) {
			// Need to delete these pesky fields
			delete req.body.warriors[warrior]['s1Opt1'];
			delete req.body.warriors[warrior]['s1Opt2'];
			delete req.body.warriors[warrior]['s1Opt3'];
			delete req.body.warriors[warrior]['s2Opt1'];
			delete req.body.warriors[warrior]['s2Opt2'];
			delete req.body.warriors[warrior]['s2Opt3'];

			updateExp = updateExp + ' #warrior' + warrior.toString() + ' = :warrior' + warrior.toString() + ',';
			expAttNames['#warrior' + warrior.toString()] = warrior.toString();
			expAttVals[':warrior' + warrior.toString()] = req.body.warriors[warrior];
		};

		if (updateExp != 'set')  // Then something was added to it
			updateExp = updateExp.slice(0, -1);

		dynamodbDoc.update({
			TableName: 'Wars',
			Key:{
				'createdAt': req.body.createdAt.toString()
			},
			UpdateExpression: updateExp,
			ExpressionAttributeNames: expAttNames,
			ExpressionAttributeValues: expAttVals
		}, function(err, data) {
			if (err) {
				console.log(err);
				return res.json({
					success: false,
					message: err.message
				});
			} else {

				res.json({
					success: true,
					message: 'Successfully Updated War'
				});
			}
		});
	});

	// SPECIFIC USERS PROFILE //
	apiRouter.route('/users/profile/:user_id')
	// (accessed at GET http://localhost:8080/api/users/:user_id) 
	.get(function(req, res) {
		dynamodb.query({
			TableName : 'Users',
			// ProjectionExpression: "#1, id, inClan, admin, dateJoined, title",
			KeyConditionExpression: '#1 = :val',
			ExpressionAttributeNames: {
				'#1': 'name'
			},
			ExpressionAttributeValues: {
				':val': { 'S': req.params.user_id }
			}
		}, function(err, data) {

			if (err) {
				return res.json({
					success: false,
					message: 'Database Error. Try again later.',
					data: err
				});
			}

			if (data.Count == 0) {
				return res.json({
					success: false,
					message: 'Query Failed. User not found.'
				});
			} else {

				// Convert Data before sending it back to client
				data = convertData(data.Items[0]);
				delete data.password; // This is important... Well, it's hashed, but still
				
				// The list of wars someone has participated in need to be compacted into a single array
				data.wars = []
				for (item in data) {
					if (!isNaN(item)) {  // We only care about the numbers, as they represent wars
						data[item]['createdAt'] = item;  // Store the war createdAt value within the object
						data.wars.push((data[item]));    // Push this object into the array
						delete data[item]				 // Delete this entry from 'data'
					}
				}

				// Sort the list of wars by start time
				data.wars.sort(function(a, b) {
					return (Number(a.start) > Number(b.start)) ? -1 : (Number(a.start) < Number(b.start)) ? 1 : 0;
				});

				res.json({
					success: true,
					message: 'Successfully returned user',
					data: data
				});
			}
		});
	})

	// update the user with this id
	// (accessed at PUT http://localhost:8080/api/users/profile/:user_id) 
	.put(function(req, res) {

		console.log(req.body);
		warID = Object.keys(req.body)[0].toString();
		console.log(warID);

		dynamodbDoc.update({
			TableName: 'Users',
			Key:{
				'name': req.params.user_id
			},
			UpdateExpression: 'set #name1 = :val1',
			ExpressionAttributeNames: {
				'#name1' : warID
			},
			ExpressionAttributeValues: {
				':val1' : req.body[warID]
			}
		}, function(err, data) {
			if (err) {
				console.log(err);
				return res.json({
					success: false,
					message: err.message
				});
			} else {
				res.json({
					success: true,
					message: 'Successfully Updated User'
				});
			}
		});
	});

	// ======================== ADMIN AUTHENTICATION ======================== //

	// route middleware to verify the token is owned by an admin
	apiRouter.use(function(req, res, next) {

		if (req.decoded.admin) {
			next();
		} else {
			return res.status(403).send({
				error: {},  // This is here for code in AuthService, DO NOT REMOVE
				success: false,
				message: 'Failed to authenticate token.'
			});
		}
	});

	// ============================= ADMIN APIS ============================= //

	apiRouter.route('/users')
	// get all the users (accessed at GET http://localhost:8080/api/users)
	.get(function(req, res) {

		dynamodb.scan({
			TableName : "Users",
			ProjectionExpression: "#n, admin, dateJoined, id, inClan, title",
			ExpressionAttributeNames: {
				"#n": "name"
			},
			Limit : 1000
		}, function(err, data) {
			if (err) { 
				return res.json({
					success: false,
				    message: 'Database Error. Try again later'
				});
			}
			res.json({
				success: true,
			    message: 'Successfully returned all Users',
				data: data.Items
			});
		});
	});

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
				console.log(err); return;
			} else{
				var date = new Date()
				var return_data = {
					signed_request: data,
					url: 'https://'+S3_BUCKET_NAME+'.s3.amazonaws.com/'+req.query.file_name
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
	
		dynamodb.query({
			TableName : 'Users',
			ProjectionExpression: "#1, id, inClan, admin, dateJoined, title",
			KeyConditionExpression: '#1 = :val',
			ExpressionAttributeNames: {
				'#1': 'name'
			},
			ExpressionAttributeValues: {
				':val': { 'S': req.params.user_id }
			},
			Limit : 1000
		}, function(err, data) {

			if (err) { 
				console.log(err.message);
				return res.json({
					success: false,
					message: 'Database Error. Try again later.',
					data: err
				});
			}

			if (data.Count == 0) {  // Then the username must have been incorrect
				return res.json({
					success: false,
					message: 'Query Failed. User not found.'
				});
			} else {
				// Convert Data before sending it back to client
				data = data.Items[0];
				data.name = data.name.S;
				data.id = data.id.S;
				data.inClan = data.inClan.BOOL;
				data.admin = data.admin.BOOL;
				data.dateJoined = data.dateJoined.N;
				data.title = data.title.S;

				res.json({
					success: true,
					message: 'Successfully returned user',
					data: data
				});
			}
		});
	})

	// update the user with this id
	// (accessed at PUT http://localhost:8080/api/users/:user_id) 
	.put(function(req, res) {

		console.log(req.body);

		updateExpression = 'set id = :val1, title = :val2, inClan = :val3, admin = :val4';
		expressionAttributeValues = {
			':val1' : req.body.id,
			':val2' : req.body.title,
			':val3' : req.body.inClan,
			':val4' : req.body.admin
		}

		if (req.body.password) {  // Then we need to change the password
			updateExpression = updateExpression + ', password = :val5';
			expressionAttributeValues[':val5'] = bcrypt.hashSync(req.body.password);
		}

		dynamodbDoc.update({
			TableName: 'Users',
			Key:{
				'name': req.body.name
			},
			UpdateExpression: updateExpression,
			ExpressionAttributeValues: expressionAttributeValues
		}, function(err, data) {
			if (err) {
				console.log(err);
				return res.json({
					success: false,
					message: err.message
				});
			} else {
				res.json({
					success: true,
					message: 'Successfully Updated User'
				});
			}
		});
	})

	// Delete the user with this id
	// (accessed at DELETE http://localhost:8080/api/users/:user_id)
	.delete(function(req, res) {
		console.log(req.decoded.name);
		if (req.decoded.name != 'Zephyro') {  // Little Fail-Safe for now.. Must be ME
			return res.json({ 
					success: false,
					message: 'You do not have permission to do this.'
			}); 
		}
		dynamodbDoc.delete({
			TableName: 'Users',
			Key:{
				'name': req.params.user_id
			}
		}, function(err, data) {
			if (err) {
				console.error('Unable to delete User. Error JSON:', JSON.stringify(err, null, 2));
				return res.json({ 
					success: false,
					message: err.message
				}); 
			} else {
				res.json({ 
					success: true,
					message: 'User Deleted' 
				});
			}
		});
	});

	apiRouter.route('/wars')
	// create a war (accessed at POST http://localhost:8080/api/wars)
	.post(function(req, res) {

		// Check to make sure the client has sent all the necessary information
		if (req.body.opponent && 
			req.body.start && 
			req.body.size
			) {
			if (!req.body.inProgress) {
				if (req.body.exp && 
					req.body.ourScore && 
					req.body.theirScore && 
					req.body.ourDest && 
					req.body.theirDest && 
					req.body.outcome &&
					req.body.warriors) {
					// Then all the attributes we need exist
				} else {
					return res.json({ 
						success: false,
						message: 'Missing necessary attributes of war' 
					});
				}
			}
			// Then all the attributes we need exist
		} else {
			return res.json({ 
				success: false,
				message: 'Missing necessary attributes of war' 
			});
		}

		var war = {
			TableName: 'Wars',
			Item: {},
			Expected: {
				"start" : { "Exists" : false },
			}
		};

		// set the war information (comes from the request)
		// Required information //
		now = new Date();
		war.Item.createdAt = now.getTime().toString();
		war.Item.opponent = req.body.opponent;
		war.Item.start = req.body.start;
		war.Item.size = req.body.size;
		if (req.body.img)  // If the image has been included, write it to DB
			war.Item.img = req.body.img;

		// Warriors are added separately, each as their own entry //
		for (var i = 0; i < req.body.warriors.length; i++) {
			// Need to delete these pesky fields
			delete req.body.warriors[i]['s1Opt1'];
			delete req.body.warriors[i]['s1Opt2'];
			delete req.body.warriors[i]['s1Opt3'];
			delete req.body.warriors[i]['s2Opt1'];
			delete req.body.warriors[i]['s2Opt2'];
			delete req.body.warriors[i]['s2Opt3'];

			war.Item[i] = req.body.warriors[i];
		};

		// Optional Information if War is Over//
		if (!req.body.inProgress) {
			war.Item.exp = req.body.exp;
			war.Item.ourScore = req.body.ourScore;
			war.Item.theirScore = req.body.theirScore;
			war.Item.ourDest = req.body.ourDest;
			war.Item.theirDest = req.body.theirDest;
			war.Item.outcome = req.body.outcome;
		}

		dynamodbDoc.put(war, function(err, data) {
			if (err) {
				console.error("Unable to add War. Error JSON:", JSON.stringify(err, null, 2));
				return res.json({ 
					success: false, 
					message: err.message
				}); 
			} else {
				res.json({ 
					success: true,
					message: 'War created!' 
				});
			}
		});
	});

	return apiRouter;

};




