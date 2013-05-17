module.exports = function(req, res, next)
{
    if (req.session.user.administrator == true)
        return next();

    else return res.redirect('/')
}
