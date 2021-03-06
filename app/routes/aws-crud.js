
var bcrypt 	= require('bcrypt-nodejs');

// Need to try/catch the config setup
var config = {}; // This is to prevent errors later
try {
	config = require('../../config.js');
} catch (e) {
	//console.log("Running on Heroku, use Config Vars");
}

var AWS_ACCESS_KEY 	= config.AWS_ACCESS_KEY_ID 		|| process.env.AWS_ACCESS_KEY_ID,
	AWS_SECRET_KEY 	= config.AWS_SECRET_ACCESS_KEY 	|| process.env.AWS_SECRET_ACCESS_KEY;

var AWS = require("aws-sdk");

AWS.config.update({
	"accessKeyId": AWS_ACCESS_KEY,
	"secretAccessKey": AWS_SECRET_KEY,
	"region": "us-west-2"
});

var dynamodb = new AWS.DynamoDB();
var dynamodbDoc = new AWS.DynamoDB.DocumentClient();

var Promise = require('bluebird');

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

module.exports = function() { 

	// Create a namespace-mimic to avoid confusion in the API file
	this.db = {}

	/* ========================== CLAN OPERATIONS ========================== */

	this.db.createClan = function(data) {
		return new Promise(function(resolve, reject) {

			// Create the user in their own clan
			members = {}
			members[data.userData.username] = data.userData;
			members[data.userData.username].position = 'Leader';

			dynamodbDoc.put({
				TableName: 'Clans',
				Item: {
					ref : data.ref,
					name : data.name,
					totalWars : data.totalWars,
					warsWon : data.warsWon,
					wars : {},
					members : members,
					notInClan : {},
					totalMembers : 1
				},
				Expected: {
					'ref' : { 'Exists' : false },
				}
			}, function(err, data) {
				if (err) {
					reject ({ 
						success: false, 
						message: err
					}); 
				} else {
					resolve ({ 
						success: true,
						message: 'Clan created!'
					});
				}
			});
		});
	}

	this.db.getClan = function(ref) {
		return new Promise(function(resolve, reject) {

			dynamodb.query({
				TableName : 'Clans',
				KeyConditionExpression: '#1 = :1',
				ExpressionAttributeNames: {
					'#1': 'ref'
				},
				ExpressionAttributeValues: {
					':1': { 'S': ref }
				}
			}, function(err, data) {
				if (err) {
					reject ({
						success: false,
						message: 'Database Error. Try again later.',
						err: err
					});
				}

				if (data.Count == 0) {  // Then the reference must have been incorrect
					reject ({
						success: false,
						message: 'Clan Reference ' + ref + ' not found'
					});
				} else {
					resolve ({
						success: true,
						message: 'Successfully found Clan',
						data: convertData(data.Items[0])
					});
				}
			});
		});
	}


	/* =========================== WAR OPERATIONS =========================== */

	this.db.createWar = function(clanRef, data) {
		return new Promise(function(resolve, reject) {

			console.log(data);

			dynamodbDoc.update({
				TableName: 'Clans',
				Key:{
					'ref': clanRef
				},
				UpdateExpression: 'set wars.#1 = :1',
				ExpressionAttributeNames: {
					'#1': String(data.createdAt)
				},
				ExpressionAttributeValues: {
					':1': data
				}
			}, function(err, data) {
				if (err) {
					console.error("Unable to add War. Error JSON:", JSON.stringify(err, null, 2));
					reject ({ 
						success: false, 
						message: err.message
					}); 
				} else {
					resolve ({
						success: true,
						message: 'War created!' 
					});
				}
			});
		});
	}

	this.db.getWars = function(clanRef) {
		return new Promise(function(resolve, reject) {

			this.db.getClan(clanRef)
			.then(function(data) {
				resolve({
					success: true,
					message: 'Successfully found clans',
					data: data.data.wars
				})
			})
			.catch(function(err) {
				reject ({
					success: false,
					message: 'Unable to retrieve wars'
				});
			});
		});
	}

	this.db.updateWar = function(ref, data) {
		return new Promise(function(resolve, reject) {

			// Initialize and assign attributes to be written to DynamoDB
			updateExp = 'set';
			expAttNames = {};
			expAttVals = {};

			// Only update the values the server is passed, 
			// and don't try to update things that do not exist
			if (data.opponent) {
				updateExp += ' #name1 = :val1,';
				expAttNames['#name1'] = 'opponent';
				expAttVals[':val1'] = data.opponent;
			} if (data.size) {
				updateExp += ' #name2 = :val2,';
				expAttNames['#name2'] = 'size';
				expAttVals[':val2'] = data.size;
			} if (data.start) {
				updateExp += ' #name3 = :val3,';
				expAttNames['#name3'] = 'start';
				expAttVals[':val3'] = data.start;
			} if (data.exp) {
				updateExp += ' #name4 = :val4,';
				expAttNames['#name4'] = 'exp';
				expAttVals[':val4'] = data.exp;
			} if (data.ourDest) {
				updateExp += ' #name5 = :val5,';
				expAttNames['#name5'] = 'ourDest';
				expAttVals[':val5'] = data.ourDest;
			} if (data.theirDest) {
				updateExp += ' #name6 = :val6,';
				expAttNames['#name6'] = 'theirDest';
				expAttVals[':val6'] = data.theirDest;
			} if (data.ourScore) {
				updateExp += ' #name7 = :val7,';
				expAttNames['#name7'] = 'ourScore';
				expAttVals[':val7'] = data.ourScore;
			} if (data.theirScore) {
				updateExp += ' #name8 = :val8,';
				expAttNames['#name8'] = 'theirScore';
				expAttVals[':val8'] = data.theirScore;
			} if (data.outcome) {
				updateExp += ' #name9 = :val9,';
				expAttNames['#name9'] = 'outcome';
				expAttVals[':val9'] = data.outcome;
			} if (data.img) {
				updateExp += ' #name10 = :val10,';
				expAttNames['#name10'] = 'img';
				expAttVals[':val10'] = data.img;
			}

			// Warriors are added separately, each as their own entry //
			for (warrior in data.warriors) {
				// Need to delete these pesky fields
				delete data.warriors[warrior]['s1Opt1'];
				delete data.warriors[warrior]['s1Opt2'];
				delete data.warriors[warrior]['s1Opt3'];
				delete data.warriors[warrior]['s2Opt1'];
				delete data.warriors[warrior]['s2Opt2'];
				delete data.warriors[warrior]['s2Opt3'];

				updateExp = updateExp + ' #warrior' + warrior.toString() + ' = :warrior' + warrior.toString() + ',';
				expAttNames['#warrior' + warrior.toString()] = warrior.toString();
				expAttVals[':warrior' + warrior.toString()] = req.body.warriors[warrior];
			};

			if (updateExp != 'set')  // Then something was added to it
				updateExp = updateExp.slice(0, -1);

			dynamodbDoc.update({
				TableName: 'Clans',
				Key:{
					'ref': ref
				},
				UpdateExpression: updateExp,
				ExpressionAttributeNames: expAttNames,
				ExpressionAttributeValues: expAttVals
			}, function(err, data) {
				if (err) {
					console.log(err);
					reject({
						success: false,
						message: err.message
					});
				} else {
					resolve({
						success: true,
						message: 'Successfully Updated War'
					});
				}
			});
		});
	}

	/* ========================== USER OPERATIONS ========================== */


	this.db.createUser = function(data) {
		return new Promise(function(resolve, reject) {
			console.log("Server Code, Creating a User");
			dynamodbDoc.put({
				TableName: 'Users',
				Item: {
					username : data.username,
					gamename : data.name,
					password : bcrypt.hashSync(data.password),
					dateJoinedSite : (new Date().getTime()),
					clan : 'null',
					siteAdmin : false,
					clanAdmin : false,
					thLvl : 1,
					kingLvl : 0,
					queenLvl : 0,
					wardenLvl : 0,
					kingFinishDate : 0,
					queenFinishDate : 0,
					wardenFinishDate : 0
				},
				Expected: {
					"username" : { "Exists" : false },
				}
			}, function(err, data) {
				if (err) {
					console.error("Unable to add user. Error JSON:", JSON.stringify(err, null, 2));
					reject({ 
						success: false, 
						message: err.message
					}); 
				} else {
					resolve({ 
						success: true,
						message: 'User created!' 
					});
				}
			});
		});
	}

	this.db.getUser = function (username) {
		return new Promise(function(resolve, reject) {
			dynamodb.query({
				TableName : "Users",
				KeyConditionExpression: "username = :1",
				ExpressionAttributeValues: {
					":1": { 'S': username }
				}
			}, function(err, data) {
				if (err) {
					reject ({
						success: false,
						message: 'Database Error. Try again later.',
						err: err
					});
				} else {
					if (data.Count == 0) {
						reject ({
							success: false,
							message: 'Query Failed. User not found.'
						});
					} else {
						resolve (
							convertData(data.Items[0])
						);
					}
				}
			});
		});
	}

	this.db.updateUser = function(username, data) {
		return new Promise(function(resolve, reject) {

			console.log(data);

			// Only write data that is verified
			var verified = [
				'thLvl',
				'password',
				'gamename',
				'clan',
				'thLvl',
				'kingLvl',
				'kingFinishDate',
				'queenLvl',
				'queenFinishDate',
				'wardenLvl',
				'dateJoinedSite',
				'siteAdmin',
			];

			// Initialize and assign attributes to be written to DynamoDB
			updateExp = 'set';
			expAttNames = {};
			expAttVals = {};

			var i = 0;
			for (var key in data) {
				console.log(key);
				console.log(verified);
				if (verified.indexOf(key) >= 0) {
					name = '#name' + i.toString();
					val = ':val' + i.toString();

					updateExp += (name + ' = ' + val + ',');
					expAttNames[name] = key;
					expAttVals[val] = data[key];

					i += 1;
				}
			}

			// Cut off the last ',' in the list
			updateExp = updateExp.slice(0, -1);

			updateExp = 'set';
			expAttNames = {};
			expAttVals = {};

			if (data.password) {  // Then we need to change the password
				updateExpression = updateExpression + ', password = :val5';
				expressionAttributeValues[':val5'] = bcrypt.hashSync(data.password);
			}

			dynamodbDoc.update({
				TableName : 'Users',
				Key : {
					username : username
				},
				UpdateExpression: 'set #name1 = :val1, #name2 = :val2, #name3 = :val3, #name4 = :val4, #name5 = :val5',
				ExpressionAttributeNames: {
					'#name1' : 'thLvl',
					'#name2' : 'kingLvl',
					'#name3' : 'queenLvl',
					'#name4' : 'kingFinishDate',
					'#name5' : 'queenFinishDate'
				},
				ExpressionAttributeValues: {
					':val1' : data.thLvl,
					':val2' : data.kingLvl,
					':val3' : data.queenLvl,
					':val4' : data.kingFinishDate,
					':val5' : data.queenFinishDate
				}
			}, function(err, data) {
				if (err) {
					console.error(err);
					reject({
						message: err.message
					});
				} else {
					resolve({
						message: 'Successfully Updated User'
					});
				}
			});
		});



		// // Only update the values the server is passed, 
		// // and don't try to update things that do not exist
		// if (data.clan) {
		// 	updateExp += ' #name1 = :val1,';
		// 	expAttNames['#name1'] = 'clan';
		// 	expAttVals[':val1'] = data.clan;
		// } 
		// if (data.size) {
		// 	updateExp += ' #name2 = :val2,';
		// 	expAttNames['#name2'] = 'size';
		// 	expAttVals[':val2'] = data.size;
		// } if (data.start) {
		// 	updateExp += ' #name3 = :val3,';
		// 	expAttNames['#name3'] = 'start';
		// 	expAttVals[':val3'] = data.start;
		// } if (data.exp) {
		// 	updateExp += ' #name4 = :val4,';
		// 	expAttNames['#name4'] = 'exp';
		// 	expAttVals[':val4'] = data.exp;
		// } if (data.ourDest) {
		// 	updateExp += ' #name5 = :val5,';
		// 	expAttNames['#name5'] = 'ourDest';
		// 	expAttVals[':val5'] = data.ourDest;
		// } if (data.theirDest) {
		// 	updateExp += ' #name6 = :val6,';
		// 	expAttNames['#name6'] = 'theirDest';
		// 	expAttVals[':val6'] = data.theirDest;
		// } if (data.ourScore) {
		// 	updateExp += ' #name7 = :val7,';
		// 	expAttNames['#name7'] = 'ourScore';
		// 	expAttVals[':val7'] = data.ourScore;
		// } if (data.theirScore) {
		// 	updateExp += ' #name8 = :val8,';
		// 	expAttNames['#name8'] = 'theirScore';
		// 	expAttVals[':val8'] = data.theirScore;
		// } if (data.outcome) {
		// 	updateExp += ' #name9 = :val9,';
		// 	expAttNames['#name9'] = 'outcome';
		// 	expAttVals[':val9'] = data.outcome;
		// } if (data.img) {
		// 	updateExp += ' #name10 = :val10,';
		// 	expAttNames['#name10'] = 'img';
		// 	expAttVals[':val10'] = data.img;
		// }

		// if (data.password) {  // Then we need to change the password
		// 	updateExpression = updateExpression + ', password = :val5';
		// 	expressionAttributeValues[':val5'] = bcrypt.hashSync(data.password);
		// }

		// // Cut off the last ',' in the list
		// updateExp = updateExp.slice(0, -1);

		// console.log(username);
		// console.log(expAttNames);
		// console.log(expAttVals);

		// dynamodbDoc.update({
		// 	TableName: 'Users',
		// 	Key: {
		// 		username : username
		// 	},
		// 	UpdateExpression: updateExp,
		// 	ExpressionAttributeNames: expAttNames,
		// 	ExpressionAttributeValues: expAttVals
		// }, function(err, data) {
		// 	if (err) {
		// 		console.log(err);
		// 		return {
		// 			success: false,
		// 			message: err.message
		// 		};
		// 	} else {
		// 		return {
		// 			success: true,
		// 			message: 'Successfully Updated User'
		// 		};
		// 	}
		// });
	}

	this.db.getUsers = function(ref) {
		return new Promise(function(resolve, reject) {

			dynamodb.query({
				TableName : "Clans",
				KeyConditionExpression: "ref = :1",
				ExpressionAttributeValues: {
					":1": { 'S': ref }
				}
			}, function(err, data) {
				if (err) {
					reject ({
						success: false,
						message: 'Database Error. Try again later.',
						err: err
					});
				} else {
					if (data.Count == 0) {
						reject ({
							success: false,
							message: 'Query Failed. Clan not found.'
						});
					} else {
						console.log(data.Items[0])
						resolve (
							convertData(data.Items[0])
						);
					}
				}
			});



			dynamodb.scan({
				TableName : "Clans",
				ProjectionExpression: "ref, admin, dateJoined, id, inClan, title",
				ExpressionAttributeNames: {
					"ref": "name"
				},
				Limit : 1000
			}, function(err, data) {
				if (err) { 
					reject({   
						success: false,
					    message: 'Database Error. Try again later'
					});
				} else {
					data = convertData(data.Items);

					resolve({
						success: true,
					    message: 'Successfully returned all Users',
						data: data
					});
				}
			});
		});
	}


	/* ======================= RANDOMDATA OPERATIONS ======================= */

	this.db.updateRandomDataRef = function(clanRef) {
		return new Promise(function(resolve, reject) {

			dynamodbDoc.update({
				TableName: 'RandomData',
				Key:{
					'name': 'takenRefs'
				},
				UpdateExpression: 'set refs.#1 = :1',
				ExpressionAttributeNames: {
					'#1' : clanRef
				},
				ExpressionAttributeValues: {
					':1' : true
				}
			}, function(err, data) {
				if (err) {
					console.error("Unable to change ID status. Error JSON:", JSON.stringify(err, null, 2));
					reject ({
						success: false, 
						message: err.message
					});
				} else {
					console.log('Ref successfully added');
					resolve ({
						success: true, 
						message: "Added the new Clan Reference to the database"
					});
				}
			});
		});
	}



};


















