// --------------------------- CALL THE PACKAGES --------------------------- //

var express		= require('express'),			// Express simplifies Node
	app			= express(),					// To hook up "app" to Express
	mongoose 	= require('mongoose'),			// Mongoose is our interface to MongoDB
	bodyParser 	= require('body-parser'),		// Allows us to parse posts
	morgan		= require('morgan'),			// Outputs all api calls to the terminal
	bcrypt 		= require('bcrypt-nodejs'),		// Encryption for user passwords
	path 		= require('path'),
	options 	= { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 10000 } },
					replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 10000 } } };

// Need to try/catch the config setup
var config = {};  // This is to prevent errors later
try {
	config = require('./config');
} catch (e) {
	console.log("Running on Heroku, use Config Vars");
}


// --------------------------- APP CONFIGURATION ---------------------------- //

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

var DATABASE_CONNECT = config.DATABASE_CONNECT || process.env.DATABASE_CONNECT;
// Set the Mongolab URL for database interactions
mongoose.connect(DATABASE_CONNECT, options);

// set static files location
// set the public folder to serve public assets such as HTML, CSS, and JS files
app.use(express.static(__dirname + '/public'));
console.log(__dirname);

// -------------------------- ROUTE CONFIGURATION --------------------------- //

if (__dirname == '/app') // only redirect in heroku deployment
{
	console.log('Using SSL Redirects!')
    app.use(function(req, res, next)
    {
        if (req.headers['x-forwarded-proto'] != 'https')
            res.redirect(['https://', req.get('Host'), req.url].join(''));
        else
            next();
    });
}


// API ROUTES ------------------------
var apiRoutes = require('./app/routes/api')(app, express); 
app.use('/api', apiRoutes);

// MAIN CATCHALL ROUTE ---------------
// SEND USERS TO FRONTEND ------------
// Basic route for the home page
// set up our one route to the index.html file
app.get('*', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});


// --------------------------- START THE SERVER ---------------------------- //
var PORT = config.PORT || process.env.PORT;
app.listen(PORT);
console.log('Node server listening on ' + PORT);



