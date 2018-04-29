Blog 		= require('../models/post');

var middlewareObj = {};

middlewareObj.checkBlogOwnership = function checkBlogOwnership(req, res, next) {
	if (req.isAuthenticated()) {
		Blog.findById(req.params.id, function(err, foundBlog) {
			if (err) {
				res.redirect('back');
			} else {
				if (foundBlog.author.id.equals(req.user._id)) {
					next();
				} else {
					req.flash('error', 'You do not have permission to do that.');
					res.redirect('back'); 
				}
			}
		});
	} else {
		req.flash('error', 'You must be logged in to do that.');
		res.redirect('back');
	}
}

middlewareObj.isLoggedIn = function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	// Flash messages, Step 1/2
	req.flash('error', 'You must be logged in to do that.');
	res.redirect('/login');
}
 
module.exports = middlewareObj;