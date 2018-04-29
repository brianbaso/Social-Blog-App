/*
	We will use the express router to refactor our routes. We will then add all of the
	routes to router, instead of app. Think of the router like an object with methods on it
	but instead the router is an object with all of the routes attached to it. At the
	bottom of the file we will have to export router so that we can import it on app.js
*/
var express 	= require('express'),
	router 		= express.Router(),
	passport	= require('passport'),
	User 		= require('../models/user');

/*
	Creating a GET route for the register form, authentication is not require for my
	personal website, but I wanted the practice and also I may build some social features on
	the app down the road.
*/
router.get('/register', function(req, res) {
	res.render('register');
});

/*
	Creating a POST route to send new user info to the passport module. If the data is
	valid, we will create a new user in the database and hash their password. This route
	takes care of all the sign up logic.
*/
router.post('/register', function(req, res) {
	var newUser = new User({username: req.body.username});
	// User object comes with the register method that takes three arguements:
	// the new User object that holds the username, the password which will be submitted
	// for hashing, and a callback function
	User.register(newUser, req.body.password, function(err, user) {
		if (err) {
			req.flash("error", err.message);
			return res.redirect('register');
		}
		passport.authenticate('local')(req, res, function() {
			req.flash('success', 'Welcome, ' + user.username);
			res.redirect('blogs');
		});
	});
});

router.get('/login', function(req, res) {

	res.render('login');
});

/*
	Creating a post route to handle users logging in.
	Takes three arguements: ('/login', middleware, callback)
*/
router.post('/login', passport.authenticate('local',
	{
		successRedirect: "/blogs",
		failureRedirect: "/login"
	}), function(req, res) { 
});

router.get('/logout', function(req, res) {
	req.logout();
	req.flash('success', 'Logged you out!');
	res.redirect('blogs');
});

router.get('/', function(req, res) {
	res.redirect('/blogs');
});

module.exports = router;