// ---------------------------- CALL THE PACKAGES ---------------------------- //
var express		= require('express'),
	app			= express(),
	mongoose 	= require('mongoose'),
	bodyParser 	= require('body-parser'),
	morgan		= require('morgan'),
	path 		= require('path'),
	options 	= { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 10000 } },
					replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 10000 } } };

// ---------------------------- APP CONFIGURATION ----------------------------- //
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


// ---------------------------- ROUTE CONFIGURATION ----------------------------- //

// Basic route for the home page
app.get('/', function(req, res) {
	res.send('Welcome to the home page!');
	// res.sendFile(path.join(__dirname + '/client/index.html'));
});

// Get an instance of the express router
var apiRouter = express.Router();

// test route to make sure everything is working
// Accessed at GET http://localhost:8080/api
apiRouter.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });
});

// more routes for our API will happen here

// REGISTER OUR ROUTES
// all of our routes will be prefixed with /api
app.use('/api', apiRouter);

// app.route('/login')
// 	// show the form (GET http://localhost:1337/login)
// 	.get(function(req, res) {
// 		res.send('this is the login form');
// 	})

// 	// process the form (POST http://localhost:1337/login)
// 	.post(function(req, res) {
// 		console.log('processing');
// 		res.send('processing the login form!');
// });

// Create routes for the admin section

// // get an instance of the router
// var adminRouter = express.Router();

// // admin main page. the dashboard (http://localhost:1337/admin)
// adminRouter.get('/', function(req, res) {
// 	res.send('I am the dashboard!');
// });

// // route middleware that will happen on every request
// adminRouter.use(function(req, res, next) { // log each request to the console
// 	console.log(req.method, req.url);
// 	// continue doing what we were doing and go to the route
// 	next(); 
// });

// // route middleware to validate :name
// adminRouter.param('name', function(req, res, next, name) {
// 	console.log('doing name validations on ' + name);

// 	if (name == 'Fuck') {
// 		console.log(name + ' is not a valid name');
// 		name = '#%*!';
// 	}

// 	// once validation is done save the new item in the req
// 	req.params.name = name;
// 	console.log(req.params)
// 	// go to the next thing
// 	next();
// });

// // route with parameters (http://localhost:1337/admin/users/:name)
// adminRouter.get('/users/:name', function(req, res) {
// 	res.send('Hello ' + req.params.name + '!');
// });

// // users page (http://localhost:1337/admin/users)
// adminRouter.get('/users', function(req, res) {
// 	res.send('I show all the users!');
// });

// // posts page (http://localhost:1337/admin/posts)
// adminRouter.get('/posts', function(req, res) {
// 	res.send('I show all the posts!');
// });

// // apply the routes to our application
// app.use('/admin', adminRouter);

// ---------------------------- START THE SERVER ----------------------------- //
app.listen(1337);
console.log('Node server listening on 1337!');