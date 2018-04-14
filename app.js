/*
	Brian Baso's Personal Website, Created April 14, 2018.

	The 'app.js' file acts as the 'behind the scenes' machine for our ejs files in the
	views directory. Server side Javascript code in this file can facilitate the exchange
	of data between the database and the front end.
*/
var express		 	= require('express'),
	app				= express(),
	bodyParser		= require('body-parser'),
	mongoose		= require('mongoose');

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

/*	
	When app.use() is called with only one arguement (a function), it will match
	every request. It will act as middleware.
	If app.use() has a route as the first arguement, it will only act on those
	requests.
*/
app.use(express.static('public'));

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

// Create reference to a Schema
var blogSchema = new mongoose.Schema({
	title: String,
	body: String,
	created: {type: Date, default: Date.now}
});

// Complile the Schema above into a model
var Blog = mongoose.model("Blog", blogSchema);

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
	})
});

app.get('/blogs/new', function(req, res) {
	res.render('new');
});

/*
	Creating a CREATE route to grab the user data from the /blogs/new form. This data is
	packaged into the req.body.blog object which is added to the database using the
	Blog.create() function.
*/
app.post('/blogs', function(req, res) {
	Blog.create(req.body.blog, function(err, newBlog) {
		if (err) {
			res.render('new');
		} else {
			res.redirect('/blogs');
		}
	})
})

/*
	Creating a show route to grab a specific object from the database and then return
	it as the foundBlog arguement to the show page.
*/
app.get('/blogs/:id', function(req, res) {
	Blog.findById(req.params.id, function(err, foundBlog) {
		if (err) {
			res.redirect('/blogs');
		} else {
			// The retrieved blog will be refered to as 'blog' in the template
			res.render('show', {blog: foundBlog});
		}
	})
});

app.get('/', function(req, res) {
	res.redirect('/blogs');
})

app.listen(3000, function() {
	console.log('Personal Website Server Started...');
})
