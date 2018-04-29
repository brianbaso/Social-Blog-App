/*
	Brian Baso's Personal Website, Created April 14, 2018.

	The 'app.js' file acts as the 'behind the scenes' machine for our ejs files in the
	views directory. Server side Javascript code in this file can facilitate the exchange
	of data between the database and the front end.
*/
var express		 		= require('express'),
	app					= express(),
	methodOverride		= require('method-override'),
	expressSanitizer	= require('express-sanitizer'),
	flash				= require('connect-flash'),
	passport			= require('passport'),
	LocalStrategy		= require('passport-local'),
	bodyParser			= require('body-parser'),
	mongoose			= require('mongoose'),
	User 				= require('./models/user'),
	Blog				= require('./models/post');

var blogRoutes			= require('./routes/blogs'),
	indexRoutes			= require('./routes/index')


/*
	MongoDB applications consist of three basic components:
		1. Establish a connection to MongoDB instance.
		2. Contains logic to access and manipulate database data.
		3. Closes the connection to the MongoDB instance.

	Four advantages of using Mongoose over native MongoDB
		1. Mongoose provides a layer over MongoDB to avoid the use of collections.
		2. Mongoose models perform majority of the work and establish default values
		for document properties and data validation.
		3. Functions may be attached to models in MongooseJS. This allows increased
		functionality.
		4. The code may be more readable and flexible because mongoose queries use
		can take advantage of chaining.

	It's important to note that mongoose also may have disadvantages when comparing
	with native MongoDB. For example, native MongoDB drivers generally have heightened
	performance over the Mongoose ORM.
*/
mongoose.connect('mongodb://localhost/personalweb');
// Test Mongoose connection
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Mongoose successfully connected to MongoDB.');
});

/*
	Template engines assist with designing HTML pages. Template engines will allow
	the use of static template files in an application. Template engines will also
	turn variables into real values upon runtime.

	Some common template engines that are compatible with express include pug,
	mustache, and ejs.
*/
app.set('view engine', 'ejs');

/*****	
	When app.use() is called with only one arguement (a function), it will match
	every request. It will act as middleware.
	If app.use() has a route as the first arguement, it will only act on those
	requests.
*****/
app.use(express.static('public'));

/*
	Use methodOverride across all pages, this module is used to overrride routes
	into PUT, DELETE, etc. since only GET and POST are supported by HTTP forms.

	All frameworks have different ways of overriding their routes.
*/
app.use(methodOverride('_method'));

/*
	Body Parser: Allow data from forms to be available in the request body object.
	Body Parser returns a function that acts as middleware. The function listens
	for req.on('data') traveling in packets and then creates the req.body object
	from the chunks of data that it has recieved.

	Since there are multiple different ways to POST data to the server, Body Parser
	will parse the data between the different types. Some of these types include
	application/json, xml, x-www-form-urlencoded or multipart/form-data.

	Some examples of Body Parser:
		1. "app.use(bodyParser.json());" for parsing json
		2. "app.use(bodyParser.urlencoded({extended: true});" for parsing urlencoded
		3. "app.use(multer());" for parsing multipart form-data
*/
app.use(bodyParser.urlencoded({extended: true}));

/*
	Express Sanitizer will prevent the use of javascript code in text forms. This
	line must be added after bodyParser.
*/
app.use(expressSanitizer());

// Allow flash messages from connect-flash module
app.use(flash());

/*
	Passport config: a bunch of mumbojumbo to automate user authentication with some 
	useful node modules
*/
app.use(require('express-session')({
	secret: 'ejjd7&&2k3(!2462ABNcNK',
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Allow req.user to be accessed in any ejs file
app.use(function(req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success');
	next();
});

/*
	Refactoring routes:
		1. Make a routes directory to divide up all the routes on the app.js file
		2. Use the express router and export all of the routes using module.exports
		3. Create variables for the new route files and include app.use statements
		on the app.js file (below)
*/
app.use(blogRoutes);
app.use(indexRoutes);

app.listen(3000, function() {
	console.log('Personal Website Server Started...');
});
