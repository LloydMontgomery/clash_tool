
var bcrypt 	= require('bcrypt-nodejs');

// Need to try/catch the config setup
var config = {}; // This is to prevent errors later
try {
	config = require('../../config.js');
} catch (e) {
	console.log("Running on Heroku, use Config Vars");
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

	// Create a namespace mimic to avoid confusion in the API file
	this.db = {}

	this.db.findClan = function(ref) {
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

	this.db.createUser = function(data) {
		return new Promise(function(resolve, reject) {

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

};