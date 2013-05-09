module.exports = function(req, res, next)
{
  if (req.session.authenticated == true)
		return next();

  else return res.redirect('/login')
}