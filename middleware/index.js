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
					res.redirect('back'); 
				}
			}
		});
	} else {
		res.redirect('back');
	}
}

middlewareObj.isLoggedIn = function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}
 
module.exports = middlewareObj;