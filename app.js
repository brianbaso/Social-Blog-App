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
	passport			= require('passport'),
	LocalStrategy		= require('passport-local'),
	bodyParser			= require('body-parser'),
	mongoose			= require('mongoose'),
	User 				= require('./models/user'),
	Blog				= require('./models/post');

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

/*
	Creating a GET route for the /blogs page, the 'index.ejs' page will now have access to
	the blogs object in MongoDB where it can be rendered through the ejs template engine.
*/
app.get('/blogs', function(req, res) {
	// Find all the blog models in the database, pass data through blogs parameter
	Blog.find({}, function(err, blogs) {
		if (err) {
			console.log(err);
		} else {
			// Recieve data from blogs parameter and call it blogs
			res.render('index', {blogs: blogs});
		}
	});
});

/*
	Creating a GET route to display the page for a new blog entry, on the page there
	will be a form with a post route.
*/
app.get('/blogs/new', function(req, res) {
	res.render('new');
});

/*
	Creating a CREATE route to grab the user data from the /blogs/new form. This data is
	packaged into the req.body.blog object which is added to the database using the
	Blog.create() function.
*/
app.post('/blogs', function(req, res) {
	// Sanitize javascript from text forms
	req.body.blog.body = req.sanitize(req.body.blog.body);

	Blog.create(req.body.blog, function(err, newBlog) {
		if (err) {
			res.render('new');
		} else {
			res.redirect('/blogs');
		}
	});
})

/*
	Creating a SHOW route to grab a specific object from the database and then return
	it as the foundBlog arguement to the show page.
*/
app.get('/blogs/:id', function(req, res) {
	// Blog.findById takes in two parameters, the id and a callback
	Blog.findById(req.params.id, function(err, foundBlog) {
		if (err) {
			res.redirect('/blogs');
		} else {
			// The retrieved blog will be refered to as 'blog' in the template.
			res.render('show', {blog: foundBlog});
		}
	});
});

/*
	Creating an EDIT route, sending data through to edit page so that user does not
	have to rewrite content when editing, instead it will be displayed through ejs.
*/
app.get('/blogs/:id/edit', function(req, res) {
	Blog.findById(req.params.id, function(err, foundBlog) {
		if (err) {
			res.redirect('/blogs');
		} else {
			res.render('edit', {blog: foundBlog});
		}
	});
});

/*
	Creating a PUT route to recieve the data from the edit form and then update the
	blog entry in the database. This could be done with a POST route but in order to 
	follow RESTful routing, a PUT route is necessary.
*/
app.put('/blogs/:id/', function(req, res) {
	// Sanitize javascript from text forms
	req.body.blog.body = req.sanitize(req.body.blog.body);
	
	// Blog.findByIdAndUpdate takes in three parameters, the id, the data from the
	// form, and a callback.
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, foundBlog) {
		if (err) {
			res.redirect('/blogs');
		} else {
			res.redirect('/blogs/' + req.params.id);
		}
	});
});

/*
	Creating a DELETE route to remove blogs from the database.
*/
app.delete('/blogs/:id', function(req, res) {
	Blog.findByIdAndRemove(req.params.id, function(err) {
		if (err) {
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs");
		}
	});
});

/*
	Creating a GET route for the register form, authentication is not require for my
	personal website, but I wanted the practice and also I may build some social features on
	the app down the road.
*/
app.get('/register', function(req, res) {
	res.render('register');
});

/*
	Creating a POST route to send new user info to the passport module. If the data is
	valid, we will create a new user in the database and hash their password. This route
	takes care of all the sign up logic.
*/
app.post('/register', function(req, res) {
	var newUser = new User({username: req.body.username});
	// User object comes with the register method that takes three arguements:
	// the new User object that holds the username, the password which will be submitted
	// for hashing, and a callback function
	User.register(newUser, req.body.password, function(err, user) {
		if (err) {
			console.log(err);
			return res.redirect('register');
		}
		passport.authenticate('local')(req, res, function() {
			res.redirect('blogs');
		});
	});
});

app.get('/login', function(req, res) {
	res.render('login');
});

/*
	Creating a post route to handle users logging in.
	Takes three arguements: ('/login', middleware, callback)
*/
app.post('/login', passport.authenticate('local',
	{
		successRedirect: "/blogs",
		failureRedirect: "/login"
	}), function(req, res) { 
});

app.get('/', function(req, res) {
	res.redirect('/blogs');
});

app.listen(3000, function() {
	console.log('Personal Website Server Started...');
});
