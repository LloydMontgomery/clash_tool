// --------------------------- CALL THE PACKAGES --------------------------- //

var express		= require('express'),			// Express simplifies Node
	app			= express(),					// To hook up "app" to Express
	mongoose 	= require('mongoose'),			// Mongoose is our interface to MongoDB
	bodyParser 	= require('body-parser'),		// Allows us to parse posts
	morgan		= require('morgan'),			// Outputs all api calls to the terminal
	bcrypt 		= require('bcrypt-nodejs');		// Encryption for user passwords
	path 		= require('path'),				
	options 	= { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 10000 } },
					replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 10000 } } };


// --------------------------- APP CONFIGURATION ---------------------------- //

// Set the Mongolab URL for database interactions
mongoose.connect('mongodb://admin:admin@ds053954.mongolab.com:53954/clash_tool', options);

// Use body parser so we can grab information from POST requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configure our app to handle CORS requests
app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
	next();
});

// Log all requests to the console
app.use(morgan('dev'));


// -------------------------- ROUTE CONFIGURATION --------------------------- //

// Basic route for the home page
app.get('/', function(req, res) {
	res.send('Welcome to the home page!');
	// res.sendFile(path.join(__dirname + '/client/index.html'));
});

// ------------------------ API ROUTE CONFIGURATION ------------------------- //


// Get an instance of the express router
var apiRouter = express.Router();

// middleware to use for all requests
apiRouter.use(function(req, res, next) {
	// do logging
	console.log('Somebody just came to our app!');
	// we'll add more to the middleware in Chapter 10
	// this is where we will authenticate users
	next(); // make sure we go to the next routes and don't stop here
});

// REGISTER OUR ROUTES, All of our routes will be prefixed with /api
app.use('/api', apiRouter);


// USERS //
apiRouter.route('/users')
// create a user (accessed at POST http://localhost:8080/api/users)
.post(function(req, res) {
	// create a new instance of the User model
	var user = new User();
	// set the users information (comes from the request)
	user.name = req.body.name;
	user.username = req.body.username;
	user.password = req.body.password;
	// save the user and check for errors
	user.save(function(err) { 
		if (err) {
			// duplicate entry
			if (err.code == 11000)
				return res.json({ success: false, message: 'A user with that username already exists.' }); 
			else
				return res.send(err);
		}
		res.json({ message: 'User created!' });
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
			user.username = req.body.username;
		if (req.body.password)
			user.password = req.body.password;
		// save the user
		user.save(function(err) {
			if (err) res.send(err);
			// return a message
			res.json({ message: 'User updated!' });
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

// ------------------------------ BASE SETUP ------------------------------- //

var User = require('./app/models/user');	// User Schema


// --------------------------- START THE SERVER ---------------------------- //

app.listen(8080);
console.log('Node server listening on 1337!');



