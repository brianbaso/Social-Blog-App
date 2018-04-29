/*
	We will use the express router to refactor our routes. We will then add all of the
	routes to router, instead of app. Think of the router like an object with methods on it
	but instead the router is an object with all of the routes attached to it. At the
	bottom of the file we will have to export router so that we can import it on app.js
*/
var express 	= require('express'),
	router 		= express.Router(),
	passport	= require('passport'),
	Blog 		= require('../models/post'),
	// Not required to add /index at the end of the route below, index.js is understood by default,
	// This is also shown in the var express = require('express') statement above.
	middleware	= require('../middleware');


/*
	Creating a GET route for the /blogs page, the 'index.ejs' page will now have access to
	the blogs object in MongoDB where it can be rendered through the ejs template engine.
*/
router.get('/blogs', function(req, res) {
	// Find all the blog models in the database, pass data through blogs parameter
	Blog.find({}, function(err, blogs) {
		if (err) {
			console.log(err);
		} else {
			// Recieve data from blogs parameter and call it blogs
			res.render('index', {blogs: blogs, currentUser: req.user});
		}
	});
});

/*
	Creating a GET route to display the page for a new blog entry, on the page there
	will be a form with a post route.
*/
router.get('/blogs/new', middleware.isLoggedIn, function(req, res) {
	res.render('new');
});

/*
	Creating a CREATE route to grab the user data from the /blogs/new form. This data is
	packaged into the req.body.blog object which is added to the database using the
	Blog.create() function.
*/
router.post('/blogs', middleware.isLoggedIn, function(req, res) {

	// Sanitize javascript from text forms
	req.body.blog.body = req.sanitize(req.body.blog.body);

	var title = req.body.blog.title;
	var body = req.body.blog.body;
	// Figure out how to capture 'created' from the schema
	var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newBlog = {title: title, body: body, author: author}

	Blog.create(newBlog, function(err, newBlog) {
		if (err) {
			console.log(err);
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
router.get('/blogs/:id', function(req, res) {
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
router.get('/blogs/:id/edit', middleware.checkBlogOwnership, function(req, res) {
	Blog.findById(req.params.id, function(err, foundBlog) {
		res.render('edit', {blog: foundBlog});
	});
});

/*
	Creating a PUT route to recieve the data from the edit form and then update the
	blog entry in the database. This could be done with a POST route but in order to 
	follow RESTful routing, a PUT route is necessary.
*/
router.put('/blogs/:id/', middleware.checkBlogOwnership, function(req, res) {
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
router.delete('/blogs/:id', middleware.checkBlogOwnership, function(req, res) {
	Blog.findByIdAndRemove(req.params.id, function(err) {
		if (err) {
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs");
		}
	});
});

module.exports = router;