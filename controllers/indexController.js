

exports.index = (req, res) => {
    if (req.user) {
        res.redirect('/app')
    } else {
        res.render('index');
    }
};